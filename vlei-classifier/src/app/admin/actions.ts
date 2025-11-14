/**
 * LEICCA vLEI Classifier - Admin Server Actions
 *
 * Server Actions for KERIA infrastructure management and credential issuance
 */

'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { ready, SignifyClient, Tier, randomNonce } from 'signify-ts';
import type {
  InfrastructureStatus,
  AIDInfo,
  RegistryInfo,
  CredentialInfo,
  ActionResult,
} from './types';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { PythonVerifierClient } from '@/services/PythonVerifierClient';

// KERIA Configuration
const KERIA_URL = process.env.KERIA_URL || 'http://127.0.0.1:3901';
const KERIA_BOOT_URL = process.env.KERIA_BOOT_URL || 'http://127.0.0.1:3903';
const PASSCODE = process.env.KERIA_PASSCODE || 'vlei-demo-12345678901'; // 21 chars

// Witness Configuration
const WITNESS_AIDS = [
  'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha',
  'BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM',
  'BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX'
];
const WITNESS_URL = process.env.WITNESS_URL || 'http://localhost:5642';
const WITNESS_URL_FOR_KERIA = process.env.WITNESS_URL_FOR_KERIA || 'http://witness-demo:5642';

// Schema SAIDs
const QVI_SCHEMA = 'EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao';
const LE_SCHEMA = 'ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY';
const ECR_SCHEMA = 'EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw';

// vLEI Server URL
const VLEI_SERVER_URL = process.env.VLEI_SERVER_URL || 'http://localhost:7723';
// KERIA runs in Docker and needs Docker service name, not localhost
const VLEI_SERVER_URL_FOR_KERIA = process.env.VLEI_SERVER_URL_FOR_KERIA || 'http://vlei-server:7723';

// KERIA Agent URL (for OOBI resolution)
const KERIA_AGENT_URL = process.env.KERIA_AGENT_URL || 'http://127.0.0.1:3902';

// Python vLEI Verifier URL
const VERIFIER_URL = process.env.VERIFIER_URL || 'http://localhost:7676';

// Persistent credential storage path (Docker volume at /app/data)
const CRED_STORE_PATH = process.env.DATA_DIR || join(process.cwd(), '.credential-store');
const CRED_STORE_FILE = join(CRED_STORE_PATH, 'issued-credentials.json');

// Save full credential to persistent storage
async function saveCredential(said: string, info: CredentialInfo, fullCred: any): Promise<void> {
  try {
    if (!existsSync(CRED_STORE_PATH)) {
      await mkdir(CRED_STORE_PATH, { recursive: true });
    }

    // Save metadata
    let creds: Record<string, CredentialInfo> = {};
    if (existsSync(CRED_STORE_FILE)) {
      const data = await readFile(CRED_STORE_FILE, 'utf-8');
      creds = JSON.parse(data);
    }
    creds[said] = info;
    await writeFile(CRED_STORE_FILE, JSON.stringify(creds, null, 2));

    // Save full credential data
    const credFile = join(CRED_STORE_PATH, `${said}.json`);
    await writeFile(credFile, JSON.stringify(fullCred, null, 2));

    console.log(`[STORE] Saved credential ${said.substring(0, 20)}...`);
  } catch (error) {
    console.error(`[STORE] Failed to save:`, error);
  }
}

// Load full credential from disk
async function loadCredential(said: string): Promise<any | null> {
  try {
    const credFile = join(CRED_STORE_PATH, `${said}.json`);
    if (!existsSync(credFile)) return null;
    const data = await readFile(credFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[STORE] Failed to load credential ${said}:`, error);
    return null;
  }
}

// Load saved credential SAIDs
async function loadCredentialSaids(): Promise<Record<string, CredentialInfo>> {
  try {
    if (!existsSync(CRED_STORE_FILE)) return {};
    const data = await readFile(CRED_STORE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[STORE] Failed to load:`, error);
    return {};
  }
}

/**
 * Get or create SignifyClient instance
 */
async function getClient(): Promise<SignifyClient> {
  // MUST call ready() before any operations
  await ready();

  const client = new SignifyClient(
    KERIA_URL,
    PASSCODE.padEnd(21, '_'), // Ensure 21 characters
    Tier.low,
    KERIA_BOOT_URL
  );

  try {
    await client.connect();
  } catch (error) {
    // If connection fails, try to boot first
    try {
      await client.boot();
      await client.connect();
    } catch (bootError) {
      throw new Error(`Failed to connect to KERIA: ${bootError instanceof Error ? bootError.message : 'Unknown error'}`);
    }
  }

  return client;
}

/**
 * Wait for operation to complete with exponential backoff
 *
 * Credential issuance operations with witnesses can take 30-120 seconds:
 * 1. Credential creation
 * 2. TEL event generation
 * 3. KEL event anchoring
 * 4. Witness receipt collection (CRITICAL - can be slow)
 */
async function waitForOperation(
  client: SignifyClient,
  opName: string,
  timeoutMs: number = 120000  // 2 minutes for witness-based credential issuance
): Promise<any> {
  console.log(`[OP] Waiting for operation: ${opName}`);
  const startTime = Date.now();
  let op = await client.operations().get(opName);
  let retries = 0;

  while (!op.done) {
    const elapsed = Date.now() - startTime;

    // Check timeout
    if (elapsed > timeoutMs) {
      console.error(`[OP] TIMEOUT:`, {
        name: opName,
        elapsed,
        done: op.done,
        error: op.error,
        metadata: op.metadata
      });
      throw new Error(
        `Operation ${opName} timed out after ${elapsed}ms. ` +
        `This may indicate witness network issues or KERIA agent problems. ` +
        `Check KERIA logs for details.`
      );
    }

    // Check for errors
    if (op.error) {
      console.error(`[OP] ERROR:`, op.error);
      throw new Error(
        `Operation ${opName} failed: ${op.error.message} ` +
        `(code: ${op.error.code})`
      );
    }

    // Log progress every 10 retries (~5-10 seconds)
    if (retries % 10 === 0 && retries > 0) {
      console.log(`[OP] Still waiting for ${opName}... elapsed=${elapsed}ms`);
    }

    // Exponential backoff: 10ms -> 20ms -> 40ms -> ... -> 10s max
    const delay = Math.max(10, Math.min(10000, 2 ** retries * 50));
    await new Promise(resolve => setTimeout(resolve, delay));

    // Refresh operation status
    op = await client.operations().get(opName);
    retries++;
  }

  const elapsed = Date.now() - startTime;
  console.log(`[OP] COMPLETED: ${opName} after ${elapsed}ms (${retries} retries)`);

  return op;
}

/**
 * Check Infrastructure Status
 */
export async function checkInfrastructureAction(): Promise<InfrastructureStatus> {
  noStore();
  const status: InfrastructureStatus = {
    keria: false,
    verifier: false,
    vleiServer: false,
    witnesses: false,
  };

  // Check KERIA
  try {
    const client = await getClient();
    status.keria = true;
  } catch (error) {
    status.error = `KERIA unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  // Check Python Verifier
  try {
    const verifierUrl = process.env.VLEI_VERIFIER_URL || 'http://localhost:7676';
    const response = await fetch(`${verifierUrl}/health`, { signal: AbortSignal.timeout(2000) });
    status.verifier = response.ok;
  } catch (error) {
    // Verifier unavailable
  }

  // Check vLEI Server
  try {
    const response = await fetch(`${VLEI_SERVER_URL}/oobi`, { signal: AbortSignal.timeout(2000) });
    status.vleiServer = response.ok || response.status === 404; // 404 is acceptable (endpoint exists)
  } catch (error) {
    // vLEI server unavailable
  }

  // Check Witnesses (assume healthy if KERIA is healthy)
  status.witnesses = status.keria;

  return status;
}

/**
 * List AIDs
 */
export async function listAIDsAction(): Promise<AIDInfo[]> {
  try {
    const client = await getClient();

    // Fetch all AIDs with pagination
    let allAids: any[] = [];
    let start = 0;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const result = await client.identifiers().list(start, start + pageSize - 1);
      allAids = allAids.concat(result.aids);

      // If we got fewer AIDs than page size, we've reached the end
      hasMore = result.aids.length === pageSize;
      start += pageSize;
    }

    return allAids.map((aid: any) => ({
      name: aid.name,
      prefix: aid.prefix,
      created: new Date(aid.created || Date.now()).toLocaleDateString(),
    }));
  } catch (error) {
    throw new Error(`Failed to list AIDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create AID
 *
 * For type='qvi': Creates a non-delegated (root) AID
 * For type='entity': Creates a delegated AID (delegatorPrefix REQUIRED)
 */
export async function createAIDAction(
  name: string,
  type: 'qvi' | 'entity',
  delegatorName?: string  // Changed to delegatorName (AID name, not prefix)
): Promise<ActionResult> {
  try {
    const client = await getClient();

    // For entity type, delegation is REQUIRED
    if (type === 'entity' && !delegatorName) {
      return {
        success: false,
        error: 'Entity AIDs must have a delegator (QVI). Please select a delegator AID.',
      };
    }

    // For QVI type, delegation is NOT allowed (must be root)
    if (type === 'qvi' && delegatorName) {
      return {
        success: false,
        error: 'QVI AIDs must be non-delegated (root). Remove delegator selection.',
      };
    }

    // Build create arguments
    const createArgs: any = {
      toad: WITNESS_AIDS.length,
      wits: WITNESS_AIDS
    };

    // Store delegator info for later use
    let delegatorAid: any = null;

    // Add delegation if entity type (need to get delegator prefix from name)
    if (type === 'entity' && delegatorName) {
      // Get delegator AID to extract its prefix
      delegatorAid = await client.identifiers().get(delegatorName);
      const delegatorPrefix = delegatorAid.prefix;

      // SKIP: Witness reintroduction causes rotation events that break credential verification
      // The rotation (drt) events get included in CESR export and verifier rejects them
      // Witnesses will eventually sync KEL naturally
      // try {
      //   await reintroduceToWitnesses(client, delegatorName);
      // } catch (err) {
      //   console.warn(`[CREATE_AID] Failed to send delegator KEL to witnesses:`, err);
      // }

      createArgs.delpre = delegatorPrefix;
      console.log(`[CREATE_AID] Creating delegated AID '${name}' with delegator: ${delegatorName} (${delegatorPrefix})`);
    } else {
      console.log(`[CREATE_AID] Creating non-delegated (root) AID '${name}'`);
    }

    // Create identifier
    console.log(`[CREATE_AID] Calling client.identifiers().create with args:`, createArgs);
    const result = await client.identifiers().create(name, createArgs);
    const createOpName = (await result.op()).name;
    console.log(`[CREATE_AID] Create result received, operation: ${createOpName}`);

    // If delegated, get AID info and approve immediately
    let finalPrefix: string;
    if (type === 'entity' && delegatorName) {
      // The AID was created (dip event) even though operation isn't done
      // Query the AID directly to get its state
      const delegatedAid = await client.identifiers().get(name);

      const seal = {
        i: delegatedAid.prefix,  // Delegate prefix
        s: "0",                   // Inception is always 0
        d: delegatedAid.prefix    // SAID - using prefix as fallback
      };

      console.log(`[CREATE_AID] Delegator '${delegatorName}' approving delegation for ${delegatedAid.prefix}`);
      const approvalResult = await client.delegations().approve(delegatorName, seal);
      const approvalOpName = (await approvalResult.op()).name;

      // Wait for approval first - this adds delegation seal to delegator KEL
      console.log(`[CREATE_AID] Waiting for delegation approval...`);
      await waitForOperation(client, approvalOpName);

      // SKIP: Witness reintroduction after approval also causes rotation events
      // Same issue as before - drt events break verification
      // if (delegatorAid) {
      //   const isDelegated = !!delegatorAid.state?.di;
      //   if (isDelegated) {
      //     console.log(`[REINTRODUCE] Skipping reintroduction of delegated delegator '${delegatorName}' (di: ${delegatorAid.state.di}) - already synced via delegation approval`);
      //     reintroduceToWitnessesAsync(client, delegatorName).catch(err => {
      //       console.warn(`[REINTRODUCE] Background reintroduction failed for ${delegatorName}:`, err);
      //     });
      //   } else {
      //     console.log(`[REINTRODUCE] Re-sending ${delegatorName} KEL to witnesses via rotation (not delegated, should be fast)...`);
      //     try {
      //       await reintroduceToWitnesses(client, delegatorName);
      //     } catch (err) {
      //       console.warn(`[CREATE_AID] Failed to send delegator KEL with seal to witnesses:`, err);
      //     }
      //   }
      // }

      // Now wait for delegated AID creation
      console.log(`[CREATE_AID] Waiting for delegated AID creation...`);
      const op = await waitForOperation(client, createOpName);
      finalPrefix = op.response.i;
      console.log(`[CREATE_AID] Delegation approved and AID created. Prefix: ${finalPrefix}`);
    } else {
      // Non-delegated: just wait for creation
      const op = await waitForOperation(client, createOpName);
      finalPrefix = op.response.i;
      console.log(`[CREATE_AID] Creation operation complete. AID prefix: ${finalPrefix}`);
    }

    return {
      success: true,
      prefix: finalPrefix,
      delegated: type === 'entity' && !!delegatorName,
      delegatorPrefix: delegatorName,  // Store the name for reference
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Re-introduce AID to witnesses by rotating then interacting
 * Rotation forces KERIA to resend full KEL history to witnesses
 */
async function reintroduceToWitnesses(client: SignifyClient, aidName: string): Promise<void> {
  console.log(`[REINTRODUCE] Re-sending ${aidName} KEL to witnesses via rotation...`);

  // Get current AID state
  const aid = await client.identifiers().get(aidName);

  // Extract witness threshold and witness list from KeyState
  const witnessThreshold = parseInt(aid.state.bt, 10);
  const witnesses = aid.state.b;

  // Do a rotation with same witness configuration to force KEL resend
  const rotateResult = await client.identifiers().rotate(aidName, {
    toad: witnessThreshold,
    // Note: rotation doesn't accept 'wits' parameter, it uses 'adds' and 'cuts'
    // Empty arrays mean no changes to witness configuration
    adds: [],
    cuts: []
  });
  const rotateOpName = (await rotateResult.op()).name;
  await waitForOperation(client, rotateOpName);

  console.log(`[REINTRODUCE] ${aidName} KEL rotation complete - witnesses updated`);
}

/**
 * Async wrapper for reintroduction - runs in background without blocking
 * Used for delegated delegators where rotation needs parent approval (30s+ delay)
 */
async function reintroduceToWitnessesAsync(client: SignifyClient, aidName: string): Promise<void> {
  console.log(`[REINTRODUCE] Starting background reintroduction for ${aidName}...`);
  await reintroduceToWitnesses(client, aidName);
  console.log(`[REINTRODUCE] Background reintroduction complete for ${aidName}`);
}

/**
 * List Registries
 */
export async function listRegistriesAction(): Promise<RegistryInfo[]> {
  try {
    const client = await getClient();
    const allAids = await listAIDsAction();
    const identifiers = { aids: allAids };

    const registries: RegistryInfo[] = [];

    // Fetch registries for each AID
    for (const aid of identifiers.aids) {
      try {
        const aidRegistries = await client.registries().list(aid.name);

        if (aidRegistries && Array.isArray(aidRegistries)) {
          for (const reg of aidRegistries) {
            registries.push({
              name: reg.name || 'unnamed',
              registryId: (reg as any).regk || (reg as any).registryId || 'unknown',
              issuerAid: aid.name,
            });
          }
        }
      } catch (error) {
        // Skip this AID if registry listing fails
        console.error(`Failed to list registries for ${aid.name}:`, error);
      }
    }

    return registries;
  } catch (error) {
    throw new Error(`Failed to list registries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create Registry
 */
export async function createRegistryAction(name: string, issuerAid: string): Promise<ActionResult> {
  try {
    const client = await getClient();

    // Create registry with default settings (no witness parameters)
    const result = await client.registries().create({
      name: issuerAid,
      registryName: name
    });

    // Wait for operation to complete
    const op = await waitForOperation(client, (await result.op()).name);

    // Fetch the registry to get its ID (op.response might not have it)
    const registries = await client.registries().list(issuerAid);
    const registry = registries.find((r: any) => r.name === name);

    if (!registry) {
      console.error('[CREATE_REGISTRY] Registry not found after creation');
      throw new Error('Registry created but not found in list');
    }

    const registryId = registry.regk;
    if (!registryId) {
      console.error('[CREATE_REGISTRY] No regk in registry:', registry);
      throw new Error('Registry found but no ID');
    }

    return {
      success: true,
      registryId,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    // If registry already exists, fetch it
    if (errorMsg.includes('already in use') || errorMsg.includes('already exists') || errorMsg.includes('409') || errorMsg.includes('400')) {
      try {
        const client = await getClient();
        const registries = await client.registries().list(issuerAid);
        const existing = registries.find((r: any) => r.name === name);
        if (existing) {
          return {
            success: true,
            registryId: existing.regk,
          };
        }
      } catch (fetchError) {
        // Fall through to error return
      }
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Resolve schema OOBI and wait for operation to complete
 * Uses VLEI_SERVER_URL_FOR_KERIA (vlei-server:7723) because KERIA runs in Docker
 */
async function resolveSchema(client: SignifyClient, schemaSaid: string): Promise<void> {
  const schemaOobi = `${VLEI_SERVER_URL_FOR_KERIA}/oobi/${schemaSaid}`;
  const oobi_op = await client.oobis().resolve(schemaOobi, `schema-${schemaSaid}`);
  await waitForOperation(client, oobi_op.name);
  console.log(`[SCHEMA] Schema ${schemaSaid} resolved successfully`);
}

/**
 * Exchange OOBIs between issuer and holder AIDs
 * This allows them to discover each other's KEL state and send IPEX messages
 */
async function exchangeOobis(
  client: SignifyClient,
  issuerName: string,
  holderName: string
): Promise<void> {
  console.log(`[OOBI] Exchanging OOBIs between ${issuerName} (issuer) ↔ ${holderName} (holder)`);

  // Get both AID states
  const issuerAid = await client.identifiers().get(issuerName);
  const holderAid = await client.identifiers().get(holderName);

  // Generate OOBIs for witness discovery
  // KERIA runs in Docker, so use WITNESS_URL_FOR_KERIA
  const issuerOobi = `${WITNESS_URL_FOR_KERIA}/oobi/${issuerAid.prefix}/witness`;
  const holderOobi = `${WITNESS_URL_FOR_KERIA}/oobi/${holderAid.prefix}/witness`;

  console.log(`[OOBI] Resolving issuer OOBI: ${issuerOobi}`);
  const op1 = await client.oobis().resolve(issuerOobi, issuerName);
  await waitForOperation(client, op1.name);

  console.log(`[OOBI] Resolving holder OOBI: ${holderOobi}`);
  const op2 = await client.oobis().resolve(holderOobi, holderName);
  await waitForOperation(client, op2.name);

  console.log(`[OOBI] ✓ Bidirectional OOBI exchange complete`);
}

/**
 * Issue QVI Credential using IPEX protocol (cross-AID)
 */
async function issueQVIWithIPEX(
  issuerName: string,
  holderName: string,
  lei: string,
  registry: string
): Promise<ActionResult> {
  console.log('[DEBUG issueQVIWithIPEX] Called with:', {
    issuerName,
    holderName,
    lei,
    registry
  });

  // Validate inputs
  if (!issuerName || !holderName || !lei || !registry) {
    console.error('[DEBUG issueQVIWithIPEX] VALIDATION FAILED - Missing parameters');
    throw new Error(`Missing required parameters: issuer=${issuerName}, holder=${holderName}, lei=${lei}, registry=${registry}`);
  }

  const client = await getClient();

  console.log(`[IPEX] Step 1: Exchanging OOBIs between ${issuerName} and ${holderName}`);
  await exchangeOobis(client, issuerName, holderName);

  // Get issuer and holder prefixes
  const issuerInfo = await client.identifiers().get(issuerName);
  const holderInfo = await client.identifiers().get(holderName);

  console.log(`[IPEX] Step 2: Creating QVI credential in issuer's database`);
  const issueResult = await client.credentials().issue(issuerName, {
    ri: registry,
    s: QVI_SCHEMA,
    a: {
      i: holderInfo.prefix,  // Holder's prefix as subject
      LEI: lei
    }
  });

  const credentialSaid = issueResult.acdc.sad.d;
  console.log(`[QVI] ✓ Credential created: ${credentialSaid}`);

  console.log(`[IPEX] Step 3: Sending IPEX grant message to holder`);
  const [grantExn, grantSigs, grantAtc] = await client.ipex().grant({
    senderName: issuerName,
    recipient: holderInfo.prefix,
    acdc: issueResult.acdc,
    iss: issueResult.iss,
    anc: issueResult.anc,
  });

  await client.ipex().submitGrant(
    issuerName,
    grantExn,
    grantSigs,
    grantAtc,
    [holderInfo.prefix]
  );

  const grantSaid = grantExn.sad.d;
  console.log(`[IPEX] ✓ GRANT sent to holder (SAID: ${grantSaid})`);

  console.log(`[IPEX] Step 4: Holder admitting QVI credential`);
  const [admitExn, admitSigs, admitAtc] = await client.ipex().admit({
    senderName: holderName,
    recipient: issuerInfo.prefix,
    grantSaid: grantSaid
  });

  await client.ipex().submitAdmit(
    holderName,
    admitExn,
    admitSigs,
    admitAtc,
    [issuerInfo.prefix]
  );
  console.log(`[IPEX] ✓ ADMIT sent by holder - QVI credential transfer complete`);

  // Fetch full CESR
  let fullCesr: string;
  try {
    fullCesr = await client.credentials().get(credentialSaid, true);
    console.log(`[QVI] Retrieved full CESR (${fullCesr.length} chars) with -IAB attachments`);
  } catch (error) {
    console.warn(`[QVI] Failed to get full CESR:`, error);
    fullCesr = issueResult.acdc.raw;
  }

  // Store credential
  await saveCredential(credentialSaid, {
    said: credentialSaid,
    type: 'QVI',
    lei,
    issued: new Date().toISOString(),
    issuer: issuerName,
    holder: holderName
  }, { sad: issueResult.acdc.sad, cesr: fullCesr });

  return {
    success: true,
    said: credentialSaid,
    credential: {
      said: credentialSaid,
      type: 'QVI',
      lei,
      issued: new Date().toISOString(),
      issuer: issuerName,
      holder: holderName
    }
  };
}

/**
 * Issue QVI Credential
 */
export async function issueQVICredentialAction(params: {
  issuerAid: string;
  holderAid?: string;  // Optional - if not provided, issuer = holder (self-issued)
  lei: string;
  registry: string;
}): Promise<ActionResult> {
  console.log('[DEBUG issueQVICredentialAction] Received params:', {
    issuerAid: params.issuerAid,
    holderAid: params.holderAid,
    lei: params.lei,
    registry: params.registry
  });

  try {
    const client = await getClient();

    // Resolve QVI schema
    await resolveSchema(client, QVI_SCHEMA);

    // Determine holder (default to issuer for self-issued)
    const holderAidName = params.holderAid || params.issuerAid;
    const usesIPEX = holderAidName !== params.issuerAid;

    console.log('[DEBUG issueQVICredentialAction] Computed values:', {
      holderAidName,
      usesIPEX
    });

    // If cross-AID, use IPEX protocol
    if (usesIPEX) {
      return await issueQVIWithIPEX(params.issuerAid, holderAidName, params.lei, params.registry);
    }

    // Self-issued QVI (issuer = holder)
    // Get issuer AID prefix
    const issuerInfo = await client.identifiers().get(params.issuerAid);

    // Issue credential
    const issueResult = await client.credentials().issue(params.issuerAid, {
      ri: params.registry,
      s: QVI_SCHEMA,
      a: {
        i: issuerInfo.prefix,
        LEI: params.lei
      }
    });

    // Don't wait for operation - TEL receipts may take minutes or never arrive
    // Credential is created successfully (witnesses processed it), just use issueResult directly
    const credentialSaid = issueResult.acdc.sad.d;
    console.log(`[QVI] ✓ Credential created: ${credentialSaid}`);

    // Fetch full CESR with attachments from KERIA
    let fullCesr: string;
    try {
      fullCesr = await client.credentials().get(credentialSaid, true);
      console.log(`[QVI] Retrieved full CESR (${fullCesr.length} chars) with -IAB attachments`);
    } catch (error) {
      console.warn(`[QVI] Failed to get full CESR, using acdc.raw fallback:`, error);
      fullCesr = issueResult.acdc.raw;
    }

    // Store credential info
    const credentialInfo: CredentialInfo = {
      said: credentialSaid,
      type: 'QVI',
      lei: params.lei,
      issued: new Date().toISOString(),
      issuer: params.issuerAid,
      holder: params.issuerAid, // QVI credential holder is same as issuer
    };

    // Save full credential with CESR format including -IAB attachments
    const credentialCesr = {
      sad: issueResult.acdc.sad,
      cesr: fullCesr,
    };
    await saveCredential(credentialInfo.said, credentialInfo, credentialCesr);

    return {
      success: true,
      said: credentialInfo.said,
      credential: credentialInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Issue LE Credential with IPEX protocol
 *
 * IPEX (Issuance and Presentation Exchange) protocol is REQUIRED when:
 * - Issuer AID ≠ Holder AID (cross-AID credential transfer)
 *
 * Steps:
 * 1. Exchange OOBIs between issuer and holder (KEL discovery)
 * 2. Issue credential (creates in issuer's DB)
 * 3. Send IPEX grant message (issuer → holder)
 * 4. Holder admits credential (auto-admit since we control both AIDs)
 */
export async function issueLECredentialAction(params: {
  issuerAid: string;
  holderAid: string;
  lei: string;
  registry: string;
  parentQviSaid: string;
}): Promise<ActionResult> {
  try {
    console.log(`[LE ISSUE] parentQviSaid received: ${params.parentQviSaid}`);
    const client = await getClient();

    // Step 1: Exchange OOBIs and get AID info
    console.log(`[IPEX] Step 1: Exchanging OOBIs between ${params.issuerAid} and ${params.holderAid}`);
    try {
      await exchangeOobis(client, params.issuerAid, params.holderAid);
      console.log(`[IPEX-DEBUG] ✓ OOBI exchange completed`);
    } catch (oobiError) {
      console.error(`[IPEX-ERROR] OOBI exchange failed:`, oobiError);
      throw oobiError;
    }

    // Get issuer and holder AID info
    console.log(`[IPEX-DEBUG] Getting AID info for issuer and holder`);
    const issuerInfo = await client.identifiers().get(params.issuerAid);
    const holderInfo = await client.identifiers().get(params.holderAid);
    console.log(`[IPEX-DEBUG] Issuer prefix: ${issuerInfo.prefix}`);
    console.log(`[IPEX-DEBUG] Holder prefix: ${holderInfo.prefix}`);

    // Resolve LE schema
    console.log(`[IPEX-DEBUG] Resolving LE schema: ${LE_SCHEMA}`);
    await resolveSchema(client, LE_SCHEMA);

    // Step 2: Issue credential (creates in issuer's DB)
    console.log(`[IPEX] Step 2: Creating credential in issuer's database`);
    let issueResult;
    try {
      issueResult = await client.credentials().issue(params.issuerAid, {
      ri: params.registry,
      s: LE_SCHEMA,
      a: {
        i: holderInfo.prefix,
        LEI: params.lei
      },
      e: {
        d: "",
        qvi: {
          n: params.parentQviSaid,
          s: QVI_SCHEMA
        }
      },
      r: {
        d: "",
        usageDisclaimer: {
          l: "Usage of a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, does not assert that the Legal Entity is trustworthy, honest, reputable in its business dealings, safe to do business with, or compliant with any laws or that an implied or expressly intended purpose will be fulfilled."
        },
        issuanceDisclaimer: {
          l: "All information in a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, is accurate as of the date the validation process was complete. The vLEI Credential has been issued to the legal entity or person named in the vLEI Credential as the subject; and the qualified vLEI Issuer exercised reasonable care to perform the validation process set forth in the vLEI Ecosystem Governance Framework."
        }
      }
    });
      console.log(`[IPEX-DEBUG] ✓ Credential issue() called, waiting for operation`);
    } catch (issueError) {
      console.error(`[IPEX-ERROR] Credential issue() failed:`, issueError);
      throw issueError;
    }

    // Don't wait for operation - TEL receipts may take minutes or never arrive
    // Credential is created successfully (witnesses processed it), just use issueResult directly
    const credentialSaid = issueResult.acdc.sad.d;
    console.log(`[LE] ✓ Credential created: ${credentialSaid}`);

    // Step 3: Send IPEX grant message (issuer → holder)
    console.log(`[IPEX] Step 3: Sending IPEX grant message to holder`);
    console.log(`[IPEX-DEBUG] Calling client.ipex().grant() with:`);
    console.log(`[IPEX-DEBUG]   senderName: ${params.issuerAid}`);
    console.log(`[IPEX-DEBUG]   recipient: ${holderInfo.prefix}`);
    console.log(`[IPEX-DEBUG]   acdc: ${JSON.stringify(issueResult.acdc).substring(0, 100)}...`);

    let grantExn, grantSigs, grantAtc;
    try {
      [grantExn, grantSigs, grantAtc] = await client.ipex().grant({
        senderName: params.issuerAid,
        recipient: holderInfo.prefix,
        acdc: issueResult.acdc,
        iss: issueResult.iss,
        anc: issueResult.anc,
      });
      console.log(`[IPEX-DEBUG] ✓ grant() returned successfully`);
    } catch (grantError) {
      console.error(`[IPEX-ERROR] grant() failed:`, grantError);
      throw grantError;
    }

    console.log(`[IPEX-DEBUG] Calling client.ipex().submitGrant()`);
    try {
      await client.ipex().submitGrant(
        params.issuerAid,
        grantExn,
        grantSigs,
        grantAtc,
        [holderInfo.prefix]
      );
      console.log(`[IPEX-DEBUG] ✓ submitGrant() returned successfully`);
    } catch (submitGrantError) {
      console.error(`[IPEX-ERROR] submitGrant() failed:`, submitGrantError);
      throw submitGrantError;
    }

    const grantSaid = grantExn.sad.d;
    console.log(`[IPEX] ✓ GRANT sent to holder (SAID: ${grantSaid})`);

    // Step 4: Holder admits (accepts) credential
    console.log(`[IPEX] Step 4: Holder admitting credential`);
    console.log(`[IPEX-DEBUG] Calling client.ipex().admit() with:`);
    console.log(`[IPEX-DEBUG]   senderName: ${params.holderAid}`);
    console.log(`[IPEX-DEBUG]   recipient: ${issuerInfo.prefix}`);
    console.log(`[IPEX-DEBUG]   grantSaid: ${grantSaid}`);

    let admitExn, admitSigs, admitAtc;
    try {
      [admitExn, admitSigs, admitAtc] = await client.ipex().admit({
        senderName: params.holderAid,
        recipient: issuerInfo.prefix,
        grantSaid: grantSaid,
      });
      console.log(`[IPEX-DEBUG] ✓ admit() returned successfully`);
    } catch (admitError) {
      console.error(`[IPEX-ERROR] admit() failed:`, admitError);
      throw admitError;
    }

    console.log(`[IPEX-DEBUG] Calling client.ipex().submitAdmit()`);
    try {
      await client.ipex().submitAdmit(
        params.holderAid,
        admitExn,
        admitSigs,
        admitAtc,
        [issuerInfo.prefix]
      );
      console.log(`[IPEX-DEBUG] ✓ submitAdmit() returned successfully`);
    } catch (submitAdmitError) {
      console.error(`[IPEX-ERROR] submitAdmit() failed:`, submitAdmitError);
      throw submitAdmitError;
    }

    console.log(`[IPEX] ✓ ADMIT sent by holder - credential transfer complete`);

    // Verify credential is actually stored in KERIA
    console.log(`[IPEX-VERIFY] Checking if credential ${credentialSaid} is in holder's wallet...`);
    try {
      const holderCreds = await client.credentials().list();
      const foundInHolder = holderCreds.find((c: any) => c.sad?.d === credentialSaid);
      console.log(`[IPEX-VERIFY] Credential in holder wallet: ${foundInHolder ? 'YES' : 'NO'}`);

      const issuerCreds = await client.credentials().list();
      const foundInIssuer = issuerCreds.find((c: any) => c.sad?.d === credentialSaid);
      console.log(`[IPEX-VERIFY] Credential in issuer wallet: ${foundInIssuer ? 'YES' : 'NO'}`);
    } catch (verifyError) {
      console.error(`[IPEX-VERIFY] Verification failed:`, verifyError);
    }

    // Fetch full CESR with attachments from KERIA
    let fullCesr: string;
    try {
      fullCesr = await client.credentials().get(credentialSaid, true);
      console.log(`[LE] Retrieved full CESR (${fullCesr.length} chars) with -IAB attachments`);
    } catch (error) {
      console.warn(`[LE] Failed to get full CESR, using acdc.raw fallback:`, error);
      fullCesr = issueResult.acdc.raw;
    }

    // Store credential info
    const credentialInfo: CredentialInfo = {
      said: credentialSaid,
      type: 'LE',
      lei: params.lei,
      issued: new Date().toISOString(),
      issuer: params.issuerAid,
      holder: params.holderAid,
    };
    const credentialCesr = {
      sad: issueResult.acdc.sad,
      cesr: fullCesr,
    };
    await saveCredential(credentialInfo.said, credentialInfo, credentialCesr);

    return {
      success: true,
      said: credentialSaid,
      credential: credentialInfo,
    };
  } catch (error) {
    console.error(`[IPEX-ERROR] issueLECredentialAction failed:`, error);
    if (error instanceof Error) {
      console.error(`[IPEX-ERROR] Error message: ${error.message}`);
      console.error(`[IPEX-ERROR] Stack trace:`, error.stack);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Issue ECR Credential with IPEX protocol
 *
 * IPEX (Issuance and Presentation Exchange) protocol is REQUIRED when:
 * - Issuer AID ≠ Holder AID (cross-AID credential transfer)
 *
 * Steps:
 * 1. Exchange OOBIs between issuer and holder (KEL discovery)
 * 2. Issue credential (creates in issuer's DB)
 * 3. Send IPEX grant message (issuer → holder)
 * 4. Holder admits credential (auto-admit since we control both AIDs)
 */
export async function issueECRCredentialAction(params: {
  issuerAid: string;
  holderAid: string;
  lei: string;
  role: string;
  personName: string;
  registry: string;
  parentLeSaid: string;
}): Promise<ActionResult> {
  try {
    const client = await getClient();

    // Step 1: Exchange OOBIs between issuer and holder
    console.log(`[IPEX] Step 1: Exchanging OOBIs between ${params.issuerAid} and ${params.holderAid}`);
    await exchangeOobis(client, params.issuerAid, params.holderAid);

    // Get issuer and holder AID info
    const issuerInfo = await client.identifiers().get(params.issuerAid);
    const holderInfo = await client.identifiers().get(params.holderAid);

    // Resolve ECR schema
    await resolveSchema(client, ECR_SCHEMA);

    // Step 2: Issue credential (creates in issuer's DB)
    console.log(`[IPEX] Step 2: Creating ECR credential in issuer's database`);
    // ECR schema requires 'u' field (salty nonce) for privacy
    const issueResult = await client.credentials().issue(params.issuerAid, {
      ri: params.registry,
      s: ECR_SCHEMA,
      u: randomNonce(), // Required salty nonce for privacy
      a: {
        u: randomNonce(), // Required in attributes block too
        i: holderInfo.prefix,
        LEI: params.lei,
        personLegalName: params.personName,
        engagementContextRole: params.role
      },
      e: {
        d: "",
        le: {
          n: params.parentLeSaid,
          s: LE_SCHEMA
        }
      },
      r: {
        d: "",
        usageDisclaimer: {
          l: "Usage of a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, does not assert that the Legal Entity is trustworthy, honest, reputable in its business dealings, safe to do business with, or compliant with any laws or that an implied or expressly intended purpose will be fulfilled."
        },
        issuanceDisclaimer: {
          l: "All information in a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, is accurate as of the date the validation process was complete. The vLEI Credential has been issued to the legal entity or person named in the vLEI Credential as the subject; and the qualified vLEI Issuer exercised reasonable care to perform the validation process set forth in the vLEI Ecosystem Governance Framework."
        },
        privacyDisclaimer: {
          l: "It is the sole responsibility of Holders as Issuees of an ECR vLEI Credential to present that Credential in a privacy-preserving manner using the mechanisms provided in the Issuance and Presentation Exchange (IPEX) protocol specification and the Authentic Chained Data Container (ACDC) specification. https://github.com/WebOfTrust/IETF-IPEX and https://github.com/trustoverip/tswg-acdc-specification."
        }
      }
    });

    // Don't wait for operation - TEL receipts may take minutes or never arrive
    // Credential is created successfully (witnesses processed it), just use issueResult directly
    const credentialSaid = issueResult.acdc.sad.d;
    console.log(`[ECR] ✓ Credential created: ${credentialSaid}`);

    // Step 3: Send IPEX grant message (issuer → holder)
    console.log(`[IPEX] Step 3: Sending IPEX grant message to holder`);
    const [grantExn, grantSigs, grantAtc] = await client.ipex().grant({
      senderName: params.issuerAid,
      recipient: holderInfo.prefix,
      acdc: issueResult.acdc,
      iss: issueResult.iss,
      anc: issueResult.anc,
    });

    await client.ipex().submitGrant(
      params.issuerAid,
      grantExn,
      grantSigs,
      grantAtc,
      [holderInfo.prefix]
    );

    const grantSaid = grantExn.sad.d;
    console.log(`[IPEX] ✓ GRANT sent to holder (SAID: ${grantSaid})`);

    // Step 4: Holder admits (accepts) credential
    console.log(`[IPEX] Step 4: Holder admitting ECR credential`);
    const [admitExn, admitSigs, admitAtc] = await client.ipex().admit({
      senderName: params.holderAid,
      recipient: issuerInfo.prefix,
      grantSaid: grantSaid,
    });

    await client.ipex().submitAdmit(
      params.holderAid,
      admitExn,
      admitSigs,
      admitAtc,
      [issuerInfo.prefix]
    );

    console.log(`[IPEX] ✓ ADMIT sent by holder - ECR credential transfer complete`);

    // Fetch full CESR with attachments from KERIA
    let fullCesr: string;
    try {
      fullCesr = await client.credentials().get(credentialSaid, true);
      console.log(`[ECR] Retrieved full CESR (${fullCesr.length} chars) with -IAB attachments`);
    } catch (error) {
      console.warn(`[ECR] Failed to get full CESR, using acdc.raw fallback:`, error);
      fullCesr = issueResult.acdc.raw;
    }

    // Store credential info
    const credentialInfo: CredentialInfo = {
      said: credentialSaid,
      type: 'ECR',
      lei: null,
      issued: new Date().toISOString(),
      issuer: params.issuerAid,
      holder: params.holderAid,
    };
    const credentialCesr = {
      sad: issueResult.acdc.sad,
      cesr: fullCesr,
    };
    await saveCredential(credentialInfo.said, credentialInfo, credentialCesr);

    return {
      success: true,
      said: credentialInfo.said,
      credential: credentialInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List Issued Credentials
 *
 * Uses GET /identifiers/{name}/credentials which works correctly,
 * unlike POST /credentials/query with filters (causes "Invalid Base64" errors)
 */
export async function listIssuedCredentialsAction(): Promise<CredentialInfo[]> {
  try {
    // Load saved credential metadata from disk
    const savedCreds = await loadCredentialSaids();
    const credentials: CredentialInfo[] = Object.values(savedCreds);

    console.log(`[CRED QUERY] Found ${credentials.length} saved credentials`);

    // Sort by timestamp descending (newest first)
    return credentials.sort((a, b) => {
      const timeA = new Date(a.issuedTimestamp || 0).getTime();
      const timeB = new Date(b.issuedTimestamp || 0).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    throw new Error(`Failed to list credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build CESR presentation for a SINGLE credential
 *
 * The Python vLEI verifier expects ONE credential per request (not concatenated chains).
 * The verifier resolves parent credentials automatically via OOBI.
 *
 * Returns CESR string with:
 * - ACDC credential JSON
 * - KEL/TEL events in -IAB attachments (from KERIA)
 *
 * @param client - SignifyClient instance
 * @param credential - Credential object with `sad` property
 * @returns Complete CESR export from KERIA
 */
async function buildCompleteCESRPresentation(client: SignifyClient, credential: any): Promise<string> {
  console.log('[CESR BUILD] Building CESR for SINGLE credential (verifier resolves chain via OOBI)...');

  // Python vLEI verifier expects ONE credential per request, not concatenated chains.
  // The verifier resolves parent credentials automatically via OOBI.
  // From verifier README: PUT /presentations/{said} expects "Credential(provided in a CESR format)" - SINGULAR

  const credSaid = credential.sad.d;
  const credType = credential.sad.s.split('/').pop(); // Extract schema type (QVI/LE/ECR)

  console.log(`[CESR BUILD] Exporting ${credType} credential: ${credSaid.substring(0, 20)}...`);

  try {
    // Get FULL CESR export from KERIA (includes KEL/TEL events in -IAB attachments)
    const credCesr = await client.credentials().get(credSaid, true);
    console.log(`[CESR BUILD] Got credential CESR length: ${credCesr.length} characters`);
    console.log(`[CESR BUILD] First 500 chars: ${credCesr.substring(0, 500)}`);
    return credCesr;
  } catch (error) {
    console.error(`[CESR BUILD] Failed to get CESR for credential ${credSaid}:`, error);
    return '';
  }
}

/**
 * Export Credential (download only)
 */
export async function exportCredentialAction(said: string, format: 'json' | 'cesr'): Promise<ActionResult> {
  try {
    const client = await getClient();

    // Load credential from disk
    const credentialData = await loadCredential(said);

    if (!credentialData) {
      return {
        success: false,
        error: 'Credential not found',
      };
    }

    // Wrap in credential object structure
    const credential = { sad: credentialData.sad, cesr: credentialData.cesr } as any;
    console.log('[EXPORT] Loaded credential from disk:', said.substring(0, 20));

    let content: string;
    let filename: string;

    if (format === 'json') {
      content = JSON.stringify(credential.sad, null, 2);
      filename = `admin-${said.substring(0, 12)}.json`;
    } else {
      // CESR format: Export single credential with KEL/TEL attachments
      content = await buildCompleteCESRPresentation(client, credential);
      filename = `admin-${said.substring(0, 12)}.cesr`;
    }

    return {
      success: true,
      content,
      filename,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Save Credential to test-credentials/ directory
 */
export async function saveCredentialToTestDirAction(
  said: string,
  type: string,
  lei: string
): Promise<ActionResult> {
  try {
    const client = await getClient();

    // Get credential by SAID
    const credentials = await client.credentials().list({
      filter: { '-d': said }
    });

    if (!credentials || credentials.length === 0) {
      return {
        success: false,
        error: 'Credential not found',
      };
    }

    const credential = credentials[0] as any;

    // Determine filename based on type and LEI
    const baseFilename = `admin-issued-${type.toLowerCase()}-${lei || said.substring(0, 12)}`;

    // Save JSON file (pretty-printed for readability)
    const json = JSON.stringify(credential.sad, null, 2);
    const jsonPath = join(process.cwd(), 'test-credentials', `${baseFilename}.json`);
    await writeFile(jsonPath, json, 'utf-8');

    // Save CESR file (compact JSON + attachment - no whitespace for CESR format)
    const atc = credential.atc || '';
    const compactJson = JSON.stringify(credential.sad);
    const cesr = compactJson + atc;
    const cesrPath = join(process.cwd(), 'test-credentials', `${baseFilename}.cesr`);
    await writeFile(cesrPath, cesr, 'utf-8');

    // Update metadata file
    await updateMetadataFile({
      type,
      said,
      lei,
      issuer: credential.sad?.i || 'unknown',
      holder: credential.sad?.a?.i || credential.sad?.i || 'unknown',
      issuedDate: credential.status?.dt || new Date().toISOString(),
      files: {
        json: `${baseFilename}.json`,
        cesr: `${baseFilename}.cesr`,
      },
    });

    return {
      success: true,
      content: `Saved to:\ntest-credentials/${baseFilename}.json\ntest-credentials/${baseFilename}.cesr`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update metadata file
 */
async function updateMetadataFile(credInfo: {
  type: string;
  said: string;
  lei: string | null;
  issuer: string;
  holder: string;
  issuedDate: string;
  files: { json: string; cesr: string };
}): Promise<void> {
  const metadataPath = join(process.cwd(), 'test-credentials', 'admin-issued-metadata.json');

  let metadata: any = {
    exportDate: new Date().toISOString(),
    credentials: [],
  };

  // Read existing metadata if it exists
  try {
    const existing = await import('fs/promises').then(fs => fs.readFile(metadataPath, 'utf-8'));
    metadata = JSON.parse(existing);
  } catch (error) {
    // File doesn't exist yet, use default
  }

  // Update or add credential entry
  const existingIndex = metadata.credentials.findIndex((c: any) => c.said === credInfo.said);

  if (existingIndex >= 0) {
    metadata.credentials[existingIndex] = credInfo;
  } else {
    metadata.credentials.push(credInfo);
  }

  metadata.exportDate = new Date().toISOString();

  // Write updated metadata
  await writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

/**
 * Configure Root of Trust in Python vLEI Verifier
 *
 * Configures a local QVI as a trusted root in the Python verifier.
 * This bypasses the GLEIF delegation requirement for local development.
 *
 * @param qviName - QVI AID name (for storage lookup)
 * @param qviPrefix - QVI AID prefix (for OOBI)
 * @returns ActionResult with success/error
 */
export async function configureRootOfTrustAction(qviName: string, qviPrefix: string): Promise<ActionResult> {
  try {
    console.log(`[ROOT OF TRUST] Configuring QVI: ${qviName} (${qviPrefix.substring(0, 20)}...)`);

    // Get KERIA client
    const client = await getClient();

    // Load saved credentials to find the most recent QVI SAID
    const savedCreds = await loadCredentialSaids();

    // Find ALL QVI credentials matching the name
    const qviCredEntries = Object.entries(savedCreds).filter(
      ([_, info]) => info.type === 'QVI' && (info.issuer === qviName || info.holder === qviName)
    );

    if (qviCredEntries.length === 0) {
      return {
        success: false,
        error: `No QVI credential found in storage for name: ${qviName}`,
      };
    }

    // Sort by issued date (most recent first) and take the newest
    qviCredEntries.sort(([_, a], [__, b]) => {
      const dateA = new Date(a.issued).getTime();
      const dateB = new Date(b.issued).getTime();
      return dateB - dateA; // Most recent first
    });

    const qviSaid = qviCredEntries[0][0];
    const qviCredInfo = qviCredEntries[0][1];
    console.log(`[ROOT OF TRUST] Using QVI credential SAID: ${qviSaid.substring(0, 20)}...`);

    // Get the issuer AID prefix for KEL retrieval
    const issuerName = qviCredInfo.issuer;
    if (!issuerName) {
      return {
        success: false,
        error: 'QVI credential missing issuer field',
      };
    }
    const issuerInfo = await client.identifiers().get(issuerName);
    const issuerPrefix = issuerInfo.prefix;
    console.log(`[ROOT OF TRUST] QVI credential issuer: ${issuerName} (${issuerPrefix.substring(0, 20)}...)`);

    // Build complete CESR from KERIA (not from file storage)
    // Step 1: Fetch full KEL for the issuer AID (not the holder)
    console.log(`[ROOT OF TRUST] Fetching KEL events for issuer AID: ${issuerPrefix}`);
    let cesr = '';

    try {
      const kel = await client.keyEvents().get(issuerPrefix);
      console.log(`[ROOT OF TRUST] Retrieved ${kel.length} KEL events for issuer`);

      for (const event of kel) {
        cesr += JSON.stringify(event.ked) + (event.atc || '');
      }
      console.log(`[ROOT OF TRUST] KEL CESR length: ${cesr.length} characters`);
    } catch (kelError) {
      console.error(`[ROOT OF TRUST] Failed to get KEL for ${issuerPrefix}:`, kelError);
      return {
        success: false,
        error: `Failed to fetch KEL for issuer: ${kelError instanceof Error ? kelError.message : 'Unknown error'}`,
      };
    }

    // Step 2: Fetch full credential CESR with -IAB attachments from KERIA
    console.log(`[ROOT OF TRUST] Fetching credential CESR for SAID: ${qviSaid.substring(0, 20)}...`);
    try {
      const credCesr = await client.credentials().get(qviSaid, true);
      console.log(`[ROOT OF TRUST] Retrieved credential CESR length: ${credCesr.length} characters`);
      cesr += credCesr;
    } catch (credError) {
      console.error(`[ROOT OF TRUST] Failed to get credential CESR for ${qviSaid}:`, credError);
      return {
        success: false,
        error: `Failed to fetch credential CESR: ${credError instanceof Error ? credError.message : 'Unknown error'}`,
      };
    }

    console.log(`[ROOT OF TRUST] Final CESR length: ${cesr.length} characters`);

    // Step 3: Configure verifier with complete CESR
    // Use issuer prefix (not holder prefix) for OOBI and endpoint
    const verifier = new PythonVerifierClient(VERIFIER_URL, KERIA_AGENT_URL);
    const success = await verifier.configureRootOfTrust(issuerPrefix, cesr, KERIA_AGENT_URL);

    if (!success) {
      return {
        success: false,
        error: 'Failed to configure Root of Trust - check verifier logs',
      };
    }

    console.log(`[ROOT OF TRUST] ✅ Successfully configured QVI as root of trust`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[ROOT OF TRUST] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get real Docker container stats
 */
export async function getDockerStatsAction(): Promise<{
  success: boolean;
  stats?: Array<{
    name: string;
    cpu: string;
    memory: string;
    memoryPercent: string;
    netIO: string;
    status: string;
  }>;
  error?: string;
}> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Get containers on gleif-internal network (with compose project prefix)
    const networkName = process.env.DOCKER_NETWORK || 'leicca_gleif-internal';
    const { stdout: networkContainers } = await execAsync(
      `docker network inspect ${networkName} --format "{{range .Containers}}{{.Name}},{{end}}"`
    );

    // Parse container names from network
    const containerNames = networkContainers
      .trim()
      .split(',')
      .filter(name => name.length > 0);

    if (containerNames.length === 0) {
      return { success: true, stats: [] };
    }

    // Get container stats (non-streaming) - filter by container names
    const { stdout: statsOutput } = await execAsync(
      `docker stats --no-stream --format "{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}}" ${containerNames.join(' ')}`
    );

    // Get container status
    const { stdout: psOutput } = await execAsync(
      `docker ps --filter "name=${containerNames.join('|')}" --format "{{.Names}},{{.Status}}"`
    );

    // Parse stats
    const statsLines = statsOutput.trim().split('\n').filter(line => line.length > 0);
    const psLines = psOutput.trim().split('\n').filter(line => line.length > 0);

    const statusMap = new Map<string, string>();
    psLines.forEach(line => {
      const [name, status] = line.split(',');
      if (name && status) {
        statusMap.set(name, status);
      }
    });

    const stats = statsLines.map(line => {
      const [name, cpu, memory, memoryPercent, netIO] = line.split(',');
      return {
        name,
        cpu,
        memory,
        memoryPercent,
        netIO,
        status: statusMap.get(name) || 'Unknown',
      };
    });

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('[DOCKER STATS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Docker stats',
    };
  }
}
