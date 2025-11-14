/**
 * LEICCA vLEI Classifier - Admin Page
 *
 * Infrastructure management for local KERIA environment, credential issuance, and system configuration
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Breadcrumb,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Alert,
  AlertTitle,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  FlowDiagram,
} from '@design-system-demo/design-system';
import type { FlowNode, FlowEdge } from '@design-system-demo/design-system';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Server,
  Network,
  FileKey,
  Award,
  Download,
  RefreshCw,
  AlertCircle,
  Save,
  ArrowRight,
  Building,
  User,
  Shield,
  Workflow,
  Database,
  Activity,
} from 'lucide-react';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import {
  checkInfrastructureAction,
  createAIDAction,
  listAIDsAction,
  createRegistryAction,
  listRegistriesAction,
  issueQVICredentialAction,
  issueLECredentialAction,
  issueECRCredentialAction,
  exportCredentialAction,
  saveCredentialToTestDirAction,
  listIssuedCredentialsAction,
  configureRootOfTrustAction,
  getDockerStatsAction,
} from './actions';
import type {
  InfrastructureStatus,
  AIDInfo,
  RegistryInfo,
  CredentialInfo,
} from './types';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function AdminPage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
  ];

  // Infrastructure Status
  const [infraStatus, setInfraStatus] = useState<InfrastructureStatus | null>(null);
  const [infraLoading, setInfraLoading] = useState<LoadingState>('idle');

  // AIDs
  const [aids, setAids] = useState<AIDInfo[]>([]);
  const [aidsLoading, setAidsLoading] = useState<LoadingState>('idle');
  const [aidName, setAidName] = useState('');
  const [aidType, setAidType] = useState<'qvi' | 'entity'>('qvi');
  const [aidDelegator, setAidDelegator] = useState('');
  const [createAidLoading, setCreateAidLoading] = useState(false);

  // Registries
  const [registries, setRegistries] = useState<RegistryInfo[]>([]);
  const [registriesLoading, setRegistriesLoading] = useState<LoadingState>('idle');
  const [registryName, setRegistryName] = useState('');
  const [registryIssuerAid, setRegistryIssuerAid] = useState('');
  const [createRegistryLoading, setCreateRegistryLoading] = useState(false);

  // Credentials
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState<LoadingState>('idle');

  // QVI Credential Form
  const [qviIssuerAid, setQviIssuerAid] = useState('');
  const [qviHolderAid, setQviHolderAid] = useState('');
  const [qviLei, setQviLei] = useState('254900OPPU84GM83MG36');
  const [qviRegistry, setQviRegistry] = useState('');
  const [issueQviLoading, setIssueQviLoading] = useState(false);

  // LE Credential Form
  const [leIssuerAid, setLeIssuerAid] = useState('');
  const [leHolderAid, setLeHolderAid] = useState('');
  const [leLei, setLeLei] = useState('254900OPPU84GM83MG36');
  const [leRegistry, setLeRegistry] = useState('');
  const [leParentQvi, setLeParentQvi] = useState('');
  const [issueLeLoading, setIssueLeLoading] = useState(false);

  // ECR Credential Form
  const [ecrIssuerAid, setEcrIssuerAid] = useState('');
  const [ecrHolderAid, setEcrHolderAid] = useState('');
  const [ecrLei, setEcrLei] = useState('254900OPPU84GM83MG36');
  const [ecrRole, setEcrRole] = useState('');
  const [ecrPersonName, setEcrPersonName] = useState('');
  const [ecrRegistry, setEcrRegistry] = useState('');
  const [ecrParentLe, setEcrParentLe] = useState('');
  const [issueEcrLoading, setIssueEcrLoading] = useState(false);

  // Status messages
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Docker stats
  const [dockerStats, setDockerStats] = useState<Array<{
    name: string;
    cpu: string;
    memory: string;
    memoryPercent: string;
    netIO: string;
    status: string;
  }> | null>(null);
  const [dockerStatsLoading, setDockerStatsLoading] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardEntityAid, setWizardEntityAid] = useState('');
  const [wizardEntityRegistry, setWizardEntityRegistry] = useState('');
  const [wizardLeSaid, setWizardLeSaid] = useState('');
  const [wizardPersonAid, setWizardPersonAid] = useState('');
  // Wizard form inputs
  const [wizardQviAid, setWizardQviAid] = useState('');
  const [wizardEntityName, setWizardEntityName] = useState('bank-entity');
  const [wizardLei, setWizardLei] = useState('254900OPPU84GM83MG36');
  const [wizardPersonName, setWizardPersonName] = useState('bank-user');
  const [wizardRole, setWizardRole] = useState('EBA Data Submitter');

  // Root of Trust configuration
  const [configureRootLoading, setConfigureRootLoading] = useState(false);

  // Load all data on mount
  useEffect(() => {
    handleCheckInfrastructure();
    handleListAids();
    handleListRegistries();
    handleListCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select first QVI when AIDs load
  useEffect(() => {
    if (aids.length > 0 && !wizardQviAid) {
      const qviAid = aids.find(aid =>
        aid.name.toLowerCase().includes('qvi') ||
        aid.name.toLowerCase().includes('issuer') ||
        aid.name.toLowerCase().includes('root')
      );
      if (qviAid) {
        setWizardQviAid(qviAid.name);
      }
    }
  }, [aids, wizardQviAid]);

  // Reset LE parent QVI when issuer changes (prevents stale credential SAID from previous issuer)
  useEffect(() => {
    setLeParentQvi('');
    setLeRegistry('');
  }, [leIssuerAid]);

  // Reset ECR parent LE when issuer changes (prevents stale credential SAID from previous issuer)
  useEffect(() => {
    setEcrParentLe('');
    setEcrRegistry('');
  }, [ecrIssuerAid]);

  // Fetch Docker stats every 5 seconds when infra is loaded
  useEffect(() => {
    if (infraLoading !== 'success') return;

    const fetchStats = async () => {
      setDockerStatsLoading(true);
      const result = await getDockerStatsAction();
      if (result.success && result.stats) {
        setDockerStats(result.stats);
      }
      setDockerStatsLoading(false);
    };

    fetchStats(); // Initial fetch
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, [infraLoading]);

  // Helper to show status message
  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    // Don't auto-clear error messages
    if (type === 'success') {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Infrastructure Status
  async function handleCheckInfrastructure() {
    setInfraLoading('loading');
    try {
      const status = await checkInfrastructureAction();
      setInfraStatus(status);
      setInfraLoading('success');
    } catch (error) {
      setInfraLoading('error');
      showStatus('error', 'Failed to check infrastructure status');
    }
  }

  // List AIDs
  async function handleListAids() {
    setAidsLoading('loading');
    try {
      const aidsList = await listAIDsAction();
      console.log('[BROWSER] Received AIDs from server:', aidsList.length);
      console.log('[BROWSER] AID names:', aidsList.map(aid => aid.name));
      console.log('[BROWSER] Full AID list:', aidsList);
      setAids(aidsList);
      setAidsLoading('success');
    } catch (error) {
      setAidsLoading('error');
      showStatus('error', 'Failed to list AIDs');
    }
  }

  // Create AID
  async function handleCreateAid() {
    if (!aidName.trim()) {
      showStatus('error', 'AID name is required');
      return;
    }

    // Validate delegator for entity type
    if (aidType === 'entity' && !aidDelegator) {
      showStatus('error', 'Entity AIDs require a delegator (QVI). Please select a delegator AID.');
      return;
    }

    setCreateAidLoading(true);
    try {
      const result = await createAIDAction(aidName, aidType, aidDelegator || undefined);
      if (result.success) {
        const delegationMsg = result.delegated
          ? ` (delegated by ${result.delegatorPrefix})`
          : ' (non-delegated root)';
        showStatus('success', `AID created: ${result.prefix}${delegationMsg}`);
        setAidName('');
        setAidDelegator('');
        await handleListAids();
      } else {
        showStatus('error', result.error || 'Failed to create AID');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to create AID');
    } finally {
      setCreateAidLoading(false);
    }
  }

  // List Registries
  async function handleListRegistries() {
    setRegistriesLoading('loading');
    try {
      const registriesList = await listRegistriesAction();
      setRegistries(registriesList);
      setRegistriesLoading('success');
    } catch (error) {
      setRegistriesLoading('error');
      showStatus('error', 'Failed to list registries');
    }
  }

  // Create Registry
  async function handleCreateRegistry() {
    if (!registryName.trim() || !registryIssuerAid) {
      showStatus('error', 'Registry name and issuer AID are required');
      return;
    }

    setCreateRegistryLoading(true);
    try {
      const result = await createRegistryAction(registryName, registryIssuerAid);
      if (result.success) {
        showStatus('success', `Registry created: ${result.registryId}`);
        setRegistryName('');
        setRegistryIssuerAid('');
        await handleListRegistries();
      } else {
        showStatus('error', result.error || 'Failed to create registry');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to create registry');
    } finally {
      setCreateRegistryLoading(false);
    }
  }

  // Issue QVI Credential
  async function handleIssueQVI() {
    console.log('[DEBUG handleIssueQVI] Starting with values:', {
      qviIssuerAid,
      qviHolderAid,
      qviLei,
      qviRegistry,
      holderAidToSend: qviHolderAid || undefined
    });

    if (!qviIssuerAid || !qviLei || !qviRegistry) {
      showStatus('error', 'Issuer AID, LEI, and Registry are required');
      return;
    }

    setIssueQviLoading(true);
    try {
      const result = await issueQVICredentialAction({
        issuerAid: qviIssuerAid,
        holderAid: qviHolderAid || undefined,  // Optional - if empty, self-issued
        lei: qviLei,
        registry: qviRegistry,
      });
      if (result.success) {
        showStatus('success', `QVI credential issued: ${result.said}`);
        setQviIssuerAid('');
        setQviHolderAid('');
        setQviLei('');
        setQviRegistry('');
        if (result.credential) {
          setCredentials(prev => [...prev, result.credential!]);
        } else {
          await handleListCredentials();
        }
      } else {
        showStatus('error', result.error || 'Failed to issue QVI credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to issue QVI credential');
    } finally {
      setIssueQviLoading(false);
    }
  }

  // Issue LE Credential
  async function handleIssueLE() {
    console.log('[handleIssueLE] Called with issuer:', leIssuerAid, 'parentQvi:', leParentQvi);

    if (!leIssuerAid || !leHolderAid || !leLei || !leRegistry || !leParentQvi) {
      showStatus('error', 'All fields are required');
      return;
    }

    // Validate that selected QVI credential holder matches issuer
    // Reload credentials from storage to ensure we have fresh data
    const freshCredentials = await listIssuedCredentialsAction();
    const selectedQvi = freshCredentials.find(c => c.said === leParentQvi);
    if (!selectedQvi) {
      showStatus('error', 'Selected QVI credential not found');
      return;
    }
    if (selectedQvi.type !== 'QVI') {
      showStatus('error', `Selected credential is type "${selectedQvi.type}", not QVI`);
      return;
    }
    if (selectedQvi.holder !== leIssuerAid) {
      showStatus('error', `Wrong QVI selected: credential holder is "${selectedQvi.holder}" but issuer is "${leIssuerAid}". The QVI credential must be held by the issuer.`);
      return;
    }

    setIssueLeLoading(true);
    try {
      const result = await issueLECredentialAction({
        issuerAid: leIssuerAid,
        holderAid: leHolderAid,
        lei: leLei,
        registry: leRegistry,
        parentQviSaid: leParentQvi,
      });
      if (result.success) {
        showStatus('success', `LE credential issued: ${result.said}`);
        setLeIssuerAid('');
        setLeHolderAid('');
        setLeLei('');
        setLeRegistry('');
        setLeParentQvi('');
        if (result.credential) {
          setCredentials(prev => [...prev, result.credential!]);
        } else {
          await handleListCredentials();
        }
      } else {
        showStatus('error', result.error || 'Failed to issue LE credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to issue LE credential');
    } finally {
      setIssueLeLoading(false);
    }
  }

  // Issue ECR Credential
  async function handleIssueECR() {
    if (!ecrIssuerAid || !ecrHolderAid || !ecrLei || !ecrRole || !ecrPersonName || !ecrRegistry || !ecrParentLe) {
      showStatus('error', 'All fields are required');
      return;
    }

    setIssueEcrLoading(true);
    try {
      const result = await issueECRCredentialAction({
        issuerAid: ecrIssuerAid,
        holderAid: ecrHolderAid,
        lei: ecrLei,
        role: ecrRole,
        personName: ecrPersonName,
        registry: ecrRegistry,
        parentLeSaid: ecrParentLe,
      });
      if (result.success) {
        showStatus('success', `ECR credential issued: ${result.said}`);
        setEcrIssuerAid('');
        setEcrHolderAid('');
        setEcrLei('');
        setEcrRole('');
        setEcrPersonName('');
        setEcrRegistry('');
        setEcrParentLe('');
        if (result.credential) {
          setCredentials(prev => [...prev, result.credential!]);
        } else {
          await handleListCredentials();
        }
      } else {
        showStatus('error', result.error || 'Failed to issue ECR credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to issue ECR credential');
    } finally {
      setIssueEcrLoading(false);
    }
  }

  // Wizard handlers
  // Find QVI AID dynamically from the list
  const getQviAidName = () => {
    // ONLY accept AIDs with "qvi" in the name - don't fallback to first AID
    const qviAid = aids.find(aid =>
      aid.name.toLowerCase().includes('qvi') ||
      aid.name.toLowerCase().includes('issuer') ||
      aid.name.toLowerCase().includes('root')
    );
    return qviAid?.name || '';
  };

  async function handleWizardStep1() {
    // Create Entity AID (delegated by QVI)
    if (!wizardEntityName.trim()) {
      showStatus('error', 'Please enter an entity name');
      return;
    }

    if (!wizardQviAid) {
      showStatus('error', 'No QVI AID selected. Select one first.');
      return;
    }

    setCreateAidLoading(true);
    try {
      // Pass QVI AID NAME (not prefix) - API will look up the prefix
      const result = await createAIDAction(wizardEntityName, 'entity', wizardQviAid);
      if (result.success && result.prefix) {
        setWizardEntityAid(wizardEntityName); // Store name, not prefix
        setWizardStep(1);
        const delegationMsg = result.delegated ? ` (delegated by ${wizardQviAid})` : '';
        showStatus('success', `Entity AID created: ${result.prefix}${delegationMsg}`);
        await handleListAids();
      } else {
        showStatus('error', result.error || 'Failed to create entity AID');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to create entity AID');
    } finally {
      setCreateAidLoading(false);
    }
  }

  async function handleWizardStep2() {
    // Issue LE Credential
    if (!wizardLei.trim()) {
      showStatus('error', 'Please enter a LEI');
      return;
    }

    setIssueLeLoading(true);
    try {
      if (!wizardQviAid) {
        showStatus('error', 'No QVI AID selected. Select one first.');
        setIssueLeLoading(false);
        return;
      }

      // Find registry owned by QVI AID
      const qviRegistry = registries.find(r => r.issuerAid === wizardQviAid);
      if (!qviRegistry) {
        showStatus('error', `No registry found for QVI AID '${wizardQviAid}'. Create one in Registries tab first.`);
        setIssueLeLoading(false);
        return;
      }

      // Find QVI credential held by the issuer (CRITICAL: must match issuer!)
      const parentQvi = credentials.find(c =>
        c.type === 'QVI' &&
        c.holder === wizardQviAid
      );

      if (!parentQvi) {
        showStatus('error', `No QVI credential found for issuer '${wizardQviAid}'. The issuer must hold a QVI credential to issue LE credentials.`);
        setIssueLeLoading(false);
        return;
      }

      console.log(`[WIZARD] Issuing LE with QVI parent: ${parentQvi.said.substring(0, 20)}... (holder: ${parentQvi.holder})`);

      const result = await issueLECredentialAction({
        issuerAid: wizardQviAid,
        holderAid: wizardEntityAid,
        lei: wizardLei,
        registry: qviRegistry.registryId,
        parentQviSaid: parentQvi.said,
      });

      if (result.success && result.said) {
        setWizardLeSaid(result.said);
        setWizardStep(2);
        showStatus('success', `LE Credential issued: ${result.said}`);
        await handleListCredentials();
      } else {
        showStatus('error', result.error || 'Failed to issue LE credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to issue LE credential');
    } finally {
      setIssueLeLoading(false);
    }
  }

  async function handleWizardStep2b() {
    // Create Registry for Entity AID
    setCreateRegistryLoading(true);
    try {
      const result = await createRegistryAction(`${wizardEntityName}-registry`, wizardEntityAid);
      if (result.success && result.registryId) {
        setWizardEntityRegistry(result.registryId);
        setWizardStep(3);
        showStatus('success', `Registry created for entity: ${result.registryId}`);
        await handleListRegistries();
      } else {
        showStatus('error', result.error || 'Failed to create entity registry');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to create entity registry');
    } finally {
      setCreateRegistryLoading(false);
    }
  }

  async function handleWizardStep3() {
    // Create Person AID (delegated by QVI)
    if (!wizardPersonName.trim()) {
      showStatus('error', 'Please enter a person name');
      return;
    }

    if (!wizardQviAid) {
      showStatus('error', 'No QVI AID selected. Select one first.');
      return;
    }

    setCreateAidLoading(true);
    try {
      // Pass QVI AID NAME (not prefix) - API will look up the prefix
      const result = await createAIDAction(wizardPersonName, 'entity', wizardQviAid);
      if (result.success && result.prefix) {
        setWizardPersonAid(wizardPersonName); // Store name, not prefix
        setWizardStep(4);
        const delegationMsg = result.delegated ? ` (delegated by ${wizardQviAid})` : '';
        showStatus('success', `Person AID created: ${result.prefix}${delegationMsg}`);
        await handleListAids();
      } else {
        showStatus('error', result.error || 'Failed to create person AID');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to create person AID');
    } finally {
      setCreateAidLoading(false);
    }
  }

  async function handleWizardStep4() {
    // Issue ECR Credential
    if (!wizardRole.trim()) {
      showStatus('error', 'Please enter a role');
      return;
    }

    setIssueEcrLoading(true);
    try {
      const result = await issueECRCredentialAction({
        issuerAid: wizardEntityAid,
        holderAid: wizardPersonAid,
        lei: wizardLei,
        role: wizardRole,
        personName: wizardPersonName,
        registry: wizardEntityRegistry,
        parentLeSaid: wizardLeSaid,
      });

      if (result.success) {
        setWizardStep(5);
        showStatus('success', `ECR Credential issued: ${result.said}`);
        await handleListCredentials();
      } else {
        showStatus('error', result.error || 'Failed to issue ECR credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to issue ECR credential');
    } finally {
      setIssueEcrLoading(false);
    }
  }

  // List Credentials
  async function handleListCredentials() {
    setCredentialsLoading('loading');
    try {
      const credentialsList = await listIssuedCredentialsAction();
      console.log('[UI] Setting credentials state:', credentialsList.length, 'total');
      console.log('[UI] LE credentials:', credentialsList.filter(c => c.type === 'LE').length);
      console.log('[UI] LE SAIDs:', credentialsList.filter(c => c.type === 'LE').map(c => c.said.substring(0, 20) + '...'));
      setCredentials(credentialsList);
      setCredentialsLoading('success');
    } catch (error) {
      setCredentialsLoading('error');
      showStatus('error', 'Failed to list credentials');
    }
  }

  // Export Credential
  async function handleExportCredential(said: string, format: 'json' | 'cesr') {
    try {
      const result = await exportCredentialAction(said, format);
      if (result.success) {
        // Download file
        const blob = new Blob([result.content!], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename!;
        a.click();
        URL.revokeObjectURL(url);
        showStatus('success', `Credential exported: ${result.filename}`);
      } else {
        showStatus('error', result.error || 'Failed to export credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to export credential');
    }
  }

  // Save Credential to test-credentials/
  async function handleSaveToTestDir(credential: CredentialInfo) {
    try {
      const result = await saveCredentialToTestDirAction(
        credential.said,
        credential.type,
        credential.lei || ''
      );
      if (result.success) {
        showStatus('success', result.content || 'Credential saved to test-credentials/');
      } else {
        showStatus('error', result.error || 'Failed to save credential');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to save credential');
    }
  }

  async function handleConfigureRootOfTrust() {
    if (!wizardQviAid) {
      showStatus('error', 'Please select a QVI AID first');
      return;
    }

    setConfigureRootLoading(true);
    try {
      // Get QVI AID prefix from name
      const qviAidInfo = aids.find(aid => aid.name === wizardQviAid);
      if (!qviAidInfo) {
        showStatus('error', 'QVI AID not found');
        setConfigureRootLoading(false);
        return;
      }

      const result = await configureRootOfTrustAction(wizardQviAid, qviAidInfo.prefix);
      if (result.success) {
        showStatus('success', `Root of Trust configured for ${wizardQviAid}`);
      } else {
        showStatus('error', result.error || 'Failed to configure Root of Trust');
      }
    } catch (error) {
      showStatus('error', error instanceof Error ? error.message : 'Failed to configure Root of Trust');
    } finally {
      setConfigureRootLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-responsive-xl font-bold text-foreground mt-4">
            vLEI Infrastructure Admin
          </h1>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Manage local KERIA environment, issue credentials, and configure infrastructure
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <Alert
            variant={statusMessage.type === 'success' ? 'default' : 'destructive'}
            className={statusMessage.type === 'success' ? 'mb-6 border-green-500/50 bg-green-500/10' : 'mb-6'}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{statusMessage.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{statusMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* Tabbed Interface */}
        <Tabs defaultValue="infrastructure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="wizard">Credential Wizard</TabsTrigger>
            <TabsTrigger value="aids">AIDs</TabsTrigger>
            <TabsTrigger value="registries">Registries</TabsTrigger>
            <TabsTrigger value="credentials">Issue Credentials</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Infrastructure Status Tab */}
          <TabsContent value="infrastructure" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Infrastructure Status
                    </CardTitle>
                    <CardDescription>
                      Real-time status of KERIA, verifier, vLEI server, and witness network
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckInfrastructure}
                    disabled={infraLoading === 'loading'}
                  >
                    {infraLoading === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {infraLoading === 'loading' && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-sm text-muted-foreground">
                      Checking infrastructure...
                    </span>
                  </div>
                )}

                {infraLoading === 'error' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Failed to check infrastructure</AlertTitle>
                    <AlertDescription>
                      Could not connect to infrastructure services. Please ensure Docker containers are running.
                    </AlertDescription>
                  </Alert>
                )}

                {infraLoading === 'success' && infraStatus && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* KERIA Agent */}
                      <Link
                        href="/admin/infrastructure/keria"
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            KERIA Agent
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-sm text-muted-foreground">http://127.0.0.1:3901</div>
                        </div>
                        <Badge
                          variant={infraStatus.keria ? 'default' : 'destructive'}
                          className={infraStatus.keria ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                        >
                          {infraStatus.keria ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </Badge>
                      </Link>

                      {/* Python Verifier */}
                      <Link
                        href="/admin/infrastructure/verifier"
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            Python Verifier
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-sm text-muted-foreground">http://localhost:7676</div>
                        </div>
                        <Badge
                          variant={infraStatus.verifier ? 'default' : 'destructive'}
                          className={infraStatus.verifier ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                        >
                          {infraStatus.verifier ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </Badge>
                      </Link>

                      {/* vLEI Server */}
                      <Link
                        href="/admin/infrastructure/vlei-server"
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            vLEI Server
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-sm text-muted-foreground">http://localhost:7723</div>
                        </div>
                        <Badge
                          variant={infraStatus.vleiServer ? 'default' : 'destructive'}
                          className={infraStatus.vleiServer ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                        >
                          {infraStatus.vleiServer ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </Badge>
                      </Link>

                      {/* Witness Network */}
                      <Link
                        href="/admin/infrastructure/witnesses"
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            Witness Network
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-sm text-muted-foreground">Ports 5642-5644</div>
                        </div>
                        <Badge
                          variant={infraStatus.witnesses ? 'default' : 'destructive'}
                          className={infraStatus.witnesses ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                        >
                          {infraStatus.witnesses ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Healthy
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </Badge>
                      </Link>
                    </div>

                    {infraStatus.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Connection Error</AlertTitle>
                        <AlertDescription>{infraStatus.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Container Performance Monitor (Visual) */}
            {infraLoading === 'success' && infraStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Container Performance Monitor
                  </CardTitle>
                  <CardDescription>
                    Live resource usage from running Docker containers (refreshes every 5s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dockerStatsLoading && !dockerStats && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {dockerStats && dockerStats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dockerStats.map((container) => {
                        const cpuPercent = parseFloat(container.cpu.replace('%', '')) || 0;
                        const memPercent = parseFloat(container.memoryPercent.replace('%', '')) || 0;
                        const isRunning = container.status.toLowerCase().includes('up');

                        // Determine badge label based on container name
                        let badge = 'Service';
                        if (container.name.includes('traefik')) badge = 'Proxy';
                        else if (container.name.includes('leicca') || container.name.includes('app')) badge = 'Web';
                        else if (container.name.includes('keria')) badge = 'KERI';
                        else if (container.name.includes('verifier')) badge = 'Python';
                        else if (container.name.includes('vlei-server')) badge = 'API';
                        else if (container.name.includes('witness')) badge = `${container.name.includes('demo') ? '3 nodes' : 'Witness'}`;

                        return (
                          <div key={container.name} className="space-y-3 p-4 rounded-lg border bg-card">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="font-semibold text-sm">{container.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">{badge}</Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>CPU</span>
                                <span className="font-mono">{container.cpu}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(cpuPercent, 100)}%` }} />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Memory</span>
                                <span className="font-mono">{container.memory.split('/')[0].trim()}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all" style={{ width: `${Math.min(memPercent, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {dockerStats && dockerStats.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No running containers found
                    </div>
                  )}

                  {dockerStats && dockerStats.length > 0 && (
                    <>
                      {/* System Totals */}
                      <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
                        <div className="text-center space-y-1">
                          <div className="text-2xl font-bold text-primary">{dockerStats.length}</div>
                          <div className="text-xs text-muted-foreground">Running Containers</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-2xl font-bold text-blue-500">
                            {dockerStats.reduce((sum, c) => sum + parseFloat(c.cpu.replace('%', '')), 0).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Total CPU Usage</div>
                        </div>
                        <div className="text-center space-y-1">
                          <div className="text-2xl font-bold text-purple-500">
                            {(() => {
                              const totalMB = dockerStats.reduce((sum, c) => {
                                const match = c.memory.match(/([0-9.]+)([MG]iB?)/);
                                if (!match) return sum;
                                const value = parseFloat(match[1]);
                                const unit = match[2];
                                return sum + (unit.startsWith('G') ? value * 1024 : value);
                              }, 0);
                              return totalMB > 1024 ? `${(totalMB / 1024).toFixed(1)} GB` : `${totalMB.toFixed(0)} MB`;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Memory</div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Docker Infrastructure Diagram */}
            {infraLoading === 'success' && infraStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Docker Infrastructure
                  </CardTitle>
                  <CardDescription>
                    Complete deployment stack - containers, networks, volumes, and databases
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-visible">
                  <FlowDiagram
                      nodes={[
                        // Layer 1: User
                        {
                          id: 'browser',
                          label: 'Browser',
                          status: 'active',
                          metadata: {
                            type: 'Client',
                            description: 'Web browser accessing LEICCA dashboard via HTTPS',
                            protocol: 'HTTPS (TLS 1.3)'
                          }
                        },

                        // Layer 2: Network Edge
                        {
                          id: 'traefik-net',
                          label: 'traefik-public',
                          metadata: {
                            type: 'Docker Bridge Network',
                            description: 'External-facing Docker network for public traffic',
                            driver: 'bridge'
                          }
                        },
                        {
                          id: 'traefik-container',
                          label: 'Traefik\nContainer',
                          status: 'confirmed',
                          metadata: {
                            type: 'Reverse Proxy',
                            image: 'traefik:v2.10',
                            description: 'SSL termination, routing, and load balancing',
                            features: 'Auto-discovery, Let\'s Encrypt, Dashboard'
                          }
                        },

                        // Layer 3: Application
                        {
                          id: 'app-container',
                          label: 'LEICCA\nNext.js :4003',
                          status: 'confirmed',
                          metadata: {
                            type: 'Web Application',
                            image: 'node:20-alpine',
                            description: 'Next.js 15 App Router with React 19',
                            framework: 'Next.js 15.5.4',
                            runtime: 'Node.js 20'
                          }
                        },
                        {
                          id: 'app-volume',
                          label: 'uploads/',
                          metadata: {
                            type: 'Docker Volume',
                            description: 'Persistent storage for uploaded credential files',
                            driver: 'local'
                          }
                        },

                        // Layer 4: KERI Infrastructure
                        {
                          id: 'keria-container',
                          label: 'KERIA\nAgent',
                          status: infraStatus?.keria ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'KERI Agent',
                            source: 'github.com/WebOfTrust/keria',
                            description: 'KERI (Key Event Receipt Infrastructure) agent for AID management',
                            protocol: 'KERI v2.0',
                            language: 'Python'
                          }
                        },
                        {
                          id: 'keria-admin',
                          label: 'Admin\n:3901',
                          status: infraStatus?.keria ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'HTTP API',
                            description: 'KERIA admin interface for agent management',
                            protocol: 'HTTP REST',
                            auth: 'Basic Auth'
                          }
                        },
                        {
                          id: 'keria-boot',
                          label: 'Boot\n:3902',
                          status: infraStatus?.keria ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'HTTP API',
                            description: 'KERIA boot endpoint for agent initialization',
                            protocol: 'HTTP REST'
                          }
                        },
                        {
                          id: 'keria-agent',
                          label: 'Agent\n:3903',
                          status: infraStatus?.keria ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'HTTP API',
                            description: 'Primary KERIA agent API for credential operations',
                            protocol: 'HTTP REST + Signify-TS',
                            operations: 'AID creation, credential issuance, registry management'
                          }
                        },
                        {
                          id: 'keria-db',
                          label: 'keria.db',
                          metadata: {
                            type: 'SQLite Database',
                            description: 'Local database storing AIDs, credentials, and KEL events',
                            engine: 'SQLite 3'
                          }
                        },

                        {
                          id: 'verifier-container',
                          label: 'Python\nVerifier',
                          status: infraStatus?.verifier ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'Credential Verifier',
                            source: 'github.com/GLEIF-IT/vlei-verifier',
                            description: 'ACDC/KERI credential verification service',
                            validates: 'SAID integrity, DID resolution, registry status, witness signatures',
                            language: 'Python'
                          }
                        },
                        {
                          id: 'verifier-port',
                          label: 'HTTP\n:7676',
                          status: infraStatus?.verifier ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'HTTP API',
                            description: 'Verification endpoint accepting CESR-encoded credentials',
                            protocol: 'HTTP REST',
                            input: 'CESR (Composable Event Streaming Representation)',
                            output: 'JSON verification result'
                          }
                        },
                        {
                          id: 'verifier-cache',
                          label: 'verify/',
                          metadata: {
                            type: 'Docker Volume',
                            description: 'Cache for OOBI resolution and witness KEL fetches',
                            driver: 'local'
                          }
                        },

                        {
                          id: 'vlei-container',
                          label: 'vLEI\nServer',
                          status: infraStatus?.vleiServer ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'OOBI Server',
                            source: 'github.com/GLEIF-IT/vlei-server',
                            description: 'Out-Of-Band Introduction service for DID resolution',
                            protocol: 'HTTP + KERI OOBI',
                            language: 'Python'
                          }
                        },
                        {
                          id: 'vlei-port',
                          label: 'OOBI\n:7723',
                          status: infraStatus?.vleiServer ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'HTTP API',
                            description: 'OOBI endpoint for publishing and resolving AIDs',
                            protocol: 'KERI OOBI (Out-Of-Band Introduction)',
                            purpose: 'Enable DID discovery without central registry'
                          }
                        },
                        {
                          id: 'vlei-db',
                          label: 'vlei.db',
                          metadata: {
                            type: 'SQLite Database',
                            description: 'OOBI mappings and AID resolution cache',
                            engine: 'SQLite 3'
                          }
                        },

                        // Layer 5: Witness Network
                        {
                          id: 'witness-net',
                          label: 'witness-net',
                          metadata: {
                            type: 'Docker Internal Network',
                            description: 'Private network for witness pool communication',
                            driver: 'bridge',
                            isolated: 'true'
                          }
                        },
                        {
                          id: 'witness-1',
                          label: 'Witness 1\n:5642',
                          status: infraStatus?.witnesses ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'KERI Witness',
                            description: 'Witness node for KEL event receipt and signing',
                            protocol: 'KERI Witness Protocol',
                            role: 'Receive, validate, and sign KEL events (1/3)'
                          }
                        },
                        {
                          id: 'witness-2',
                          label: 'Witness 2\n:5643',
                          status: infraStatus?.witnesses ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'KERI Witness',
                            description: 'Witness node for KEL event receipt and signing',
                            protocol: 'KERI Witness Protocol',
                            role: 'Receive, validate, and sign KEL events (2/3)'
                          }
                        },
                        {
                          id: 'witness-3',
                          label: 'Witness 3\n:5644',
                          status: infraStatus?.witnesses ? 'confirmed' : 'failed',
                          metadata: {
                            type: 'KERI Witness',
                            description: 'Witness node for KEL event receipt and signing',
                            protocol: 'KERI Witness Protocol',
                            role: 'Receive, validate, and sign KEL events (3/3)',
                            consensus: '3/3 witnesses required for credential issuance'
                          }
                        },

                        // Layer 6: External Services
                        {
                          id: 'gleif-api',
                          label: 'GLEIF API\n(External)',
                          status: 'confirmed',
                          metadata: {
                            type: 'REST API',
                            url: 'api.gleif.org',
                            description: 'Global Legal Entity Identifier Foundation API',
                            purpose: 'LEI validation and entity data lookup',
                            protocol: 'HTTPS REST'
                          }
                        },
                        {
                          id: 'blockchain',
                          label: 'BSV Chain\n(MintBlue)',
                          status: 'confirmed',
                          metadata: {
                            type: 'Blockchain',
                            provider: 'MintBlue SDK',
                            description: 'BSV blockchain for immutable audit trail anchoring',
                            protocol: 'BSV (Bitcoin SV)',
                            basket: 'leicca-vlei-audit',
                            features: 'DocV1 encryption, BEEF proofs, Merkle verification'
                          }
                        },
                      ]}
                      edges={[
                        // User → Network Edge
                        { source: 'browser', target: 'traefik-net', label: 'HTTPS :443', value: 850 },
                        { source: 'traefik-net', target: 'traefik-container', value: 850 },

                        // Network Edge → Application
                        { source: 'traefik-container', target: 'app-container', label: 'Proxy', value: 850 },
                        { source: 'app-container', target: 'app-volume', value: 50 },

                        // Application → KERI Infrastructure
                        { source: 'app-container', target: 'keria-container', label: 'Signify', value: 250 },
                        { source: 'keria-container', target: 'keria-admin', value: 80 },
                        { source: 'keria-container', target: 'keria-boot', value: 60 },
                        { source: 'keria-container', target: 'keria-agent', value: 110 },
                        { source: 'keria-agent', target: 'keria-db', value: 110 },

                        { source: 'app-container', target: 'verifier-container', label: 'Verify', value: 300 },
                        { source: 'verifier-container', target: 'verifier-port', value: 300 },
                        { source: 'verifier-container', target: 'verifier-cache', value: 80 },

                        { source: 'app-container', target: 'vlei-container', label: 'OOBI', value: 100 },
                        { source: 'vlei-container', target: 'vlei-port', value: 100 },
                        { source: 'vlei-container', target: 'vlei-db', value: 40 },

                        // Application → External
                        { source: 'app-container', target: 'gleif-api', label: 'LEI', value: 150 },
                        { source: 'app-container', target: 'blockchain', label: 'Anchor', value: 150 },

                        // KERI → Witness Network
                        { source: 'keria-agent', target: 'witness-net', label: 'KEL', value: 90 },
                        { source: 'witness-net', target: 'witness-1', value: 30 },
                        { source: 'witness-net', target: 'witness-2', value: 30 },
                        { source: 'witness-net', target: 'witness-3', value: 30 },

                        { source: 'verifier-port', target: 'witness-net', label: 'Fetch', value: 60 },
                      ]}
                      variant="sankey"
                      className="h-[700px] !overflow-visible"
                      aria-label="Docker Infrastructure Architecture"
                    />

                  {/* Infrastructure Legend */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-blue-500" />
                        <span className="text-muted-foreground">Docker Container</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500" />
                        <span className="text-muted-foreground">Docker Network</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500" />
                        <span className="text-muted-foreground">Volume / Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary/20 border-2 border-primary" />
                        <span className="text-muted-foreground">Healthy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive/20 border-2 border-destructive" />
                        <span className="text-muted-foreground">Unavailable</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Credential Wizard Tab */}
          <TabsContent value="wizard" className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    Credential Issuance Wizard
                  </CardTitle>
                  <CardDescription>
                    Guided workflow to issue vLEI credentials: Entity AID → LE Credential → Person AID → ECR Credential
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Pre-filled Configuration */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Pre-configured Settings
                  </h3>
                  <div className="grid gap-3 text-sm">
                    <div className="space-y-2">
                      <Label htmlFor="wizard-qvi-select">QVI AID</Label>
                      <Select value={wizardQviAid} onValueChange={setWizardQviAid}>
                        <SelectTrigger id="wizard-qvi-select">
                          <SelectValue placeholder="Select QVI AID" />
                        </SelectTrigger>
                        <SelectContent>
                          {aids
                            .filter(aid =>
                              aid.name.toLowerCase().includes('qvi') ||
                              aid.name.toLowerCase().includes('issuer') ||
                              aid.name.toLowerCase().includes('root')
                            )
                            .map((aid) => (
                              <SelectItem key={aid.prefix} value={aid.name}>
                                {aid.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleConfigureRootOfTrust}
                        disabled={!wizardQviAid || configureRootLoading}
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                      >
                        {configureRootLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {configureRootLoading ? 'Configuring...' : 'Configure Root of Trust'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sets up Python verifier to trust this QVI for local development
                      </p>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <span className="text-muted-foreground">Default LEI:</span>
                      <code className="text-xs bg-background px-2 py-1 rounded border font-mono">
                        254900OPPU84GM83MG36
                      </code>
                    </div>
                  </div>
                </div>

                {/* Stepper */}
                <div className="space-y-6">
                  {/* Step 1: Create Entity AID */}
                  <div className={`relative ${wizardStep >= 1 ? 'opacity-100' : 'opacity-100'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            wizardStep > 0
                              ? 'border-green-500 bg-green-500/10'
                              : wizardStep === 0
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          {wizardStep > 0 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Building className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {wizardStep < 4 && <div className="w-0.5 h-16 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">Step 1: Create Entity AID</h4>
                          <p className="text-sm text-muted-foreground">
                            Create a delegated AID for the bank or organization (delegated by QVI)
                          </p>
                        </div>
                        {wizardStep === 0 && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="wizard-entity-name">Entity Name</Label>
                              <Input
                                id="wizard-entity-name"
                                value={wizardEntityName}
                                onChange={(e) => setWizardEntityName(e.target.value)}
                                placeholder="e.g., cayman-bank, singapore-fund"
                                className="max-w-md"
                              />
                              <p className="text-xs text-muted-foreground">
                                A unique identifier for this organization (e.g., bank, investment fund)
                              </p>
                            </div>
                            <Button onClick={handleWizardStep1} disabled={createAidLoading}>
                              {createAidLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Create Delegated Entity AID
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              This AID will be delegated by: <strong>{wizardQviAid || 'No QVI selected'}</strong>
                            </p>
                          </div>
                        )}
                        {wizardStep > 0 && wizardEntityAid && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              Entity AID Created
                            </p>
                            <code className="text-xs font-mono block text-muted-foreground">
                              {wizardEntityAid}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Issue LE Credential */}
                  <div className={`relative ${wizardStep >= 2 ? 'opacity-100' : wizardStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            wizardStep > 1
                              ? 'border-green-500 bg-green-500/10'
                              : wizardStep === 1
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          {wizardStep > 1 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Award className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {wizardStep < 4 && <div className="w-0.5 h-16 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">Step 2: Issue LE Credential</h4>
                          <p className="text-sm text-muted-foreground">
                            Issue Legal Entity vLEI credential from QVI to the entity AID
                          </p>
                        </div>
                        {wizardStep === 1 && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="wizard-lei">Legal Entity Identifier (LEI)</Label>
                              <Input
                                id="wizard-lei"
                                value={wizardLei}
                                onChange={(e) => setWizardLei(e.target.value)}
                                placeholder="20-character LEI code"
                                maxLength={20}
                                className="max-w-md font-mono"
                              />
                              <p className="text-xs text-muted-foreground">
                                The 20-character LEI from GLEIF (e.g., 254900OPPU84GM83MG36)
                              </p>
                            </div>
                            <Button onClick={handleWizardStep2} disabled={issueLeLoading}>
                              {issueLeLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Issue LE Credential
                            </Button>
                          </div>
                        )}
                        {wizardStep > 1 && wizardLeSaid && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              LE Credential Issued
                            </p>
                            <code className="text-xs font-mono block text-muted-foreground">
                              {wizardLeSaid}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2b: Create Entity Registry */}
                  <div className={`relative ${wizardStep >= 3 ? 'opacity-100' : wizardStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            wizardStep > 2
                              ? 'border-green-500 bg-green-500/10'
                              : wizardStep === 2
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          {wizardStep > 2 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Database className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {wizardStep < 5 && <div className="w-0.5 h-16 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">Step 2b: Create Entity Registry</h4>
                          <p className="text-sm text-muted-foreground">
                            Create a registry for the entity AID to issue ECR credentials
                          </p>
                        </div>
                        {wizardStep === 2 && (
                          <div className="space-y-3">
                            <Button onClick={handleWizardStep2b} disabled={createRegistryLoading}>
                              {createRegistryLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Create Entity Registry
                            </Button>
                          </div>
                        )}
                        {wizardStep > 2 && wizardEntityRegistry && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              Entity Registry Created
                            </p>
                            <code className="text-xs font-mono block text-muted-foreground">
                              {wizardEntityRegistry}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Create Person AID */}
                  <div className={`relative ${wizardStep >= 4 ? 'opacity-100' : wizardStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            wizardStep > 3
                              ? 'border-green-500 bg-green-500/10'
                              : wizardStep === 3
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          {wizardStep > 3 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {wizardStep < 5 && <div className="w-0.5 h-16 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">Step 3: Create Person AID</h4>
                          <p className="text-sm text-muted-foreground">
                            Create a delegated AID for the employee/person (delegated by QVI)
                          </p>
                        </div>
                        {wizardStep === 3 && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="wizard-person-name">Person Name</Label>
                              <Input
                                id="wizard-person-name"
                                value={wizardPersonName}
                                onChange={(e) => setWizardPersonName(e.target.value)}
                                placeholder="e.g., john-doe, alice-smith"
                                className="max-w-md"
                              />
                              <p className="text-xs text-muted-foreground">
                                A unique identifier for this person/employee
                              </p>
                            </div>
                            <Button onClick={handleWizardStep3} disabled={createAidLoading}>
                              {createAidLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Create Delegated Person AID
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              This AID will be delegated by: <strong>{wizardQviAid || 'No QVI selected'}</strong>
                            </p>
                          </div>
                        )}
                        {wizardStep > 3 && wizardPersonAid && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              Person AID Created
                            </p>
                            <code className="text-xs font-mono block text-muted-foreground">
                              {wizardPersonAid}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Issue ECR Credential */}
                  <div className={`relative ${wizardStep >= 5 ? 'opacity-100' : wizardStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            wizardStep > 4
                              ? 'border-green-500 bg-green-500/10'
                              : wizardStep === 4
                              ? 'border-primary bg-primary/10'
                              : 'border-muted bg-muted'
                          }`}
                        >
                          {wizardStep > 4 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Shield className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold">Step 4: Issue ECR Credential</h4>
                          <p className="text-sm text-muted-foreground">
                            Issue Engagement Context Role credential (e.g., EBA Data Submitter) to the person AID
                          </p>
                        </div>
                        {wizardStep === 4 && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="wizard-role">Role</Label>
                              <Input
                                id="wizard-role"
                                value={wizardRole}
                                onChange={(e) => setWizardRole(e.target.value)}
                                placeholder="e.g., EBA Data Submitter, Chief Compliance Officer"
                                className="max-w-md"
                              />
                              <p className="text-xs text-muted-foreground">
                                The official role or title for this credential (e.g., EBA Data Submitter)
                              </p>
                            </div>
                            <Button onClick={handleWizardStep4} disabled={issueEcrLoading}>
                              {issueEcrLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Issue ECR Credential
                            </Button>
                          </div>
                        )}
                        {wizardStep > 4 && (
                          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                              ECR Credential Issued - Complete!
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Full credential chain created: QVI → LE → ECR
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                {wizardStep > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWizardStep(0);
                        setWizardEntityAid('');
                        setWizardEntityRegistry('');
                        setWizardLeSaid('');
                        setWizardPersonAid('');
                        setWizardEntityName('bank-entity');
                        setWizardLei('254900OPPU84GM83MG36');
                        setWizardPersonName('bank-user');
                        setWizardRole('EBA Data Submitter');
                        showStatus('success', 'Wizard reset - ready to start new credential chain');
                      }}
                    >
                      Reset Wizard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AID Management Tab */}
          <TabsContent value="aids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileKey className="h-5 w-5" />
                  Create AID
                </CardTitle>
                <CardDescription>
                  Create a new QVI or Entity AID for credential issuance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aid-name">AID Name</Label>
                    <Input
                      id="aid-name"
                      placeholder="e.g., qvi-issuer or entity-holder"
                      value={aidName}
                      onChange={(e) => setAidName(e.target.value)}
                      disabled={createAidLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aid-type">AID Type</Label>
                    <Select
                      value={aidType}
                      onValueChange={(value) => {
                        setAidType(value as 'qvi' | 'entity');
                        // Clear delegator when switching to QVI
                        if (value === 'qvi') {
                          setAidDelegator('');
                        }
                      }}
                      disabled={createAidLoading}
                    >
                      <SelectTrigger id="aid-type">
                        <SelectValue placeholder="Select AID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qvi">QVI (Root)</SelectItem>
                        <SelectItem value="entity">Entity (Delegated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aid-delegator">
                      Delegator AID
                      {aidType === 'entity' && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Select
                      value={aidDelegator}
                      onValueChange={setAidDelegator}
                      disabled={createAidLoading || aidType === 'qvi'}
                    >
                      <SelectTrigger id="aid-delegator">
                        <SelectValue placeholder={aidType === 'qvi' ? 'N/A (root AID)' : 'Select delegator...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.prefix} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {aidType === 'entity' && (
                      <p className="text-xs text-muted-foreground">
                        Required for entity AIDs (delegated by QVI)
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCreateAid}
                      disabled={
                        createAidLoading ||
                        !aidName.trim() ||
                        (aidType === 'entity' && !aidDelegator)
                      }
                      className="w-full"
                    >
                      {createAidLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create AID'
                      )}
                    </Button>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>QVI AIDs:</strong> Created as non-delegated roots (no delegator needed).
                    <br />
                    <strong>Entity AIDs:</strong> Created as delegated AIDs (delegator required - select a QVI).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AIDs List</CardTitle>
                    <CardDescription>All created AIDs in the KERIA agent</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListAids}
                    disabled={aidsLoading === 'loading'}
                  >
                    {aidsLoading === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aidsLoading === 'loading' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {aidsLoading === 'success' && aids.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No AIDs found. Create your first AID above.
                  </div>
                )}

                {aidsLoading === 'success' && aids.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>AID Prefix</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aids.map((aid) => (
                        <TableRow key={aid.name}>
                          <TableCell className="font-medium">{aid.name}</TableCell>
                          <TableCell className="font-mono text-xs">{aid.prefix}</TableCell>
                          <TableCell>{aid.created}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registry Management Tab */}
          <TabsContent value="registries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Create Registry
                </CardTitle>
                <CardDescription>
                  Create a new credential registry for an issuer AID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registry-name">Registry Name</Label>
                    <Input
                      id="registry-name"
                      placeholder="e.g., my-registry"
                      value={registryName}
                      onChange={(e) => setRegistryName(e.target.value)}
                      disabled={createRegistryLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registry-issuer">Issuer AID</Label>
                    <Select
                      value={registryIssuerAid}
                      onValueChange={setRegistryIssuerAid}
                      disabled={createRegistryLoading}
                    >
                      <SelectTrigger id="registry-issuer">
                        <SelectValue placeholder="Select issuer AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available - create one first</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleCreateRegistry}
                      disabled={createRegistryLoading || !registryName.trim() || !registryIssuerAid}
                      className="w-full"
                    >
                      {createRegistryLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Registry'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Note: Load AIDs first if dropdown is empty
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registries List</CardTitle>
                    <CardDescription>All created registries</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListRegistries}
                    disabled={registriesLoading === 'loading'}
                  >
                    {registriesLoading === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {registriesLoading === 'loading' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {registriesLoading === 'success' && registries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No registries found. Create your first registry above.
                  </div>
                )}

                {registriesLoading === 'success' && registries.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registry Name</TableHead>
                        <TableHead>Registry ID</TableHead>
                        <TableHead>Issuer AID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registries.map((registry) => (
                        <TableRow key={registry.registryId}>
                          <TableCell className="font-medium">{registry.name}</TableCell>
                          <TableCell className="font-mono text-xs">{registry.registryId}</TableCell>
                          <TableCell>{registry.issuerAid}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credential Issuance Tab */}
          <TabsContent value="credentials" className="space-y-6">
            {/* QVI Credential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Issue QVI Credential
                </CardTitle>
                <CardDescription>
                  Issue a Qualified vLEI Issuer credential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qvi-issuer">Issuer AID</Label>
                    <Select
                      value={qviIssuerAid}
                      onValueChange={setQviIssuerAid}
                      disabled={issueQviLoading}
                    >
                      <SelectTrigger id="qvi-issuer">
                        <SelectValue placeholder="Select issuer AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qvi-holder">Holder AID (optional)</Label>
                    <Select
                      value={qviHolderAid || 'SELF'}
                      onValueChange={(value) => setQviHolderAid(value === 'SELF' ? '' : value)}
                      disabled={issueQviLoading}
                    >
                      <SelectTrigger id="qvi-holder">
                        <SelectValue placeholder="Same as issuer (self-issued)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SELF">Same as issuer (self-issued)</SelectItem>
                        {aids.map((aid) => (
                          <SelectItem key={aid.name} value={aid.name}>
                            {aid.name} ({aid.prefix.substring(0, 12)}...)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qvi-lei">LEI</Label>
                    <Input
                      id="qvi-lei"
                      placeholder="e.g., 254900OPPU84GM83MG36"
                      value={qviLei}
                      onChange={(e) => setQviLei(e.target.value)}
                      disabled={issueQviLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qvi-registry">Registry</Label>
                    <Select
                      value={qviRegistry}
                      onValueChange={setQviRegistry}
                      disabled={issueQviLoading}
                    >
                      <SelectTrigger id="qvi-registry">
                        <SelectValue placeholder="Select registry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const filteredRegistries = qviIssuerAid
                            ? registries.filter(r => r.issuerAid === qviIssuerAid)
                            : registries;

                          return filteredRegistries.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {qviIssuerAid ? 'No registries for this AID' : 'No registries available'}
                            </SelectItem>
                          ) : (
                            filteredRegistries.map((registry) => (
                              <SelectItem key={registry.registryId} value={registry.registryId}>
                                {registry.name} ({registry.issuerAid})
                              </SelectItem>
                            ))
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleIssueQVI}
                      disabled={issueQviLoading || !qviIssuerAid || !qviLei || !qviRegistry}
                      className="w-full"
                    >
                      {issueQviLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        'Issue QVI Credential'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LE Credential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Issue Legal Entity Credential
                </CardTitle>
                <CardDescription>
                  Issue a Legal Entity vLEI credential with QVI edge block
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="le-issuer">Issuer AID (QVI)</Label>
                    <Select
                      value={leIssuerAid}
                      onValueChange={setLeIssuerAid}
                      disabled={issueLeLoading}
                    >
                      <SelectTrigger id="le-issuer">
                        <SelectValue placeholder="Select issuer AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="le-holder">Holder AID (Entity)</Label>
                    <Select
                      value={leHolderAid}
                      onValueChange={setLeHolderAid}
                      disabled={issueLeLoading}
                    >
                      <SelectTrigger id="le-holder">
                        <SelectValue placeholder="Select holder AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="le-lei">LEI</Label>
                    <Input
                      id="le-lei"
                      placeholder="e.g., 5493001KJTIIGC8Y1R17"
                      value={leLei}
                      onChange={(e) => setLeLei(e.target.value)}
                      disabled={issueLeLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="le-registry">Registry</Label>
                    <Select
                      value={leRegistry}
                      onValueChange={setLeRegistry}
                      disabled={issueLeLoading}
                    >
                      <SelectTrigger id="le-registry">
                        <SelectValue placeholder="Select registry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const filteredRegistries = leIssuerAid
                            ? registries.filter(r => r.issuerAid === leIssuerAid)
                            : registries;

                          return filteredRegistries.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {leIssuerAid ? 'No registries for this AID' : 'No registries available'}
                            </SelectItem>
                          ) : (
                            filteredRegistries.map((registry) => (
                              <SelectItem key={registry.registryId} value={registry.registryId}>
                                {registry.name} ({registry.issuerAid})
                              </SelectItem>
                            ))
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="le-parent-qvi">Parent QVI Credential</Label>
                    <Select
                      value={leParentQvi}
                      onValueChange={(value) => {
                        const qviCreds = credentials.filter(c => c.type === 'QVI' && c.holder === leIssuerAid);
                        if (qviCreds.length === 1 && qviCreds[0].said !== value) {
                          console.error('[BUG] Wrong QVI selected! Expected:', qviCreds[0].said.substring(0,20), 'Got:', value.substring(0,20));
                        }
                        setLeParentQvi(value);
                      }}
                      disabled={issueLeLoading}
                    >
                      <SelectTrigger id="le-parent-qvi">
                        <SelectValue placeholder="Select parent QVI credential..." />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials.filter(c => c.type === 'QVI' && c.holder === leIssuerAid).length === 0 ? (
                          <SelectItem value="none" disabled>
                            {leIssuerAid ? `No QVI credentials held by ${leIssuerAid}` : 'Select issuer AID first'}
                          </SelectItem>
                        ) : (
                          credentials.filter(c => c.type === 'QVI' && c.holder === leIssuerAid).map((cred) => (
                            <SelectItem key={cred.said} value={cred.said}>
                              {cred.said.substring(0, 20)}... (issued by {cred.issuer})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleIssueLE}
                      disabled={issueLeLoading || !leIssuerAid || !leHolderAid || !leLei || !leRegistry || !leParentQvi}
                      className="w-full"
                    >
                      {issueLeLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        'Issue LE Credential'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ECR Credential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Issue ECR Credential
                </CardTitle>
                <CardDescription>
                  Issue an Engagement Context Role credential with LE edge block
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ecr-issuer">Issuer AID (LE Entity)</Label>
                    <Select
                      value={ecrIssuerAid}
                      onValueChange={setEcrIssuerAid}
                      disabled={issueEcrLoading}
                    >
                      <SelectTrigger id="ecr-issuer">
                        <SelectValue placeholder="Select issuer AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-holder">Holder AID (Entity)</Label>
                    <Select
                      value={ecrHolderAid}
                      onValueChange={setEcrHolderAid}
                      disabled={issueEcrLoading}
                    >
                      <SelectTrigger id="ecr-holder">
                        <SelectValue placeholder="Select holder AID..." />
                      </SelectTrigger>
                      <SelectContent>
                        {aids.length === 0 ? (
                          <SelectItem value="none" disabled>No AIDs available</SelectItem>
                        ) : (
                          aids.map((aid) => (
                            <SelectItem key={aid.name} value={aid.name}>
                              {aid.name} ({aid.prefix.substring(0, 12)}...)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-lei">LEI</Label>
                    <Input
                      id="ecr-lei"
                      placeholder="e.g., 5493001KJTIIGC8Y1R17"
                      value={ecrLei}
                      onChange={(e) => setEcrLei(e.target.value)}
                      disabled={issueEcrLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-role">Engagement Context Role</Label>
                    <Input
                      id="ecr-role"
                      placeholder="e.g., EBA Data Submitter, CFO, CEO"
                      value={ecrRole}
                      onChange={(e) => setEcrRole(e.target.value)}
                      disabled={issueEcrLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-person-name">Person Legal Name</Label>
                    <Input
                      id="ecr-person-name"
                      placeholder="e.g., John Smith"
                      value={ecrPersonName}
                      onChange={(e) => setEcrPersonName(e.target.value)}
                      disabled={issueEcrLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-registry">Registry</Label>
                    <Select
                      value={ecrRegistry}
                      onValueChange={setEcrRegistry}
                      disabled={issueEcrLoading}
                    >
                      <SelectTrigger id="ecr-registry">
                        <SelectValue placeholder="Select registry..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const filteredRegistries = ecrIssuerAid
                            ? registries.filter(r => r.issuerAid === ecrIssuerAid)
                            : registries;

                          return filteredRegistries.length === 0 ? (
                            <SelectItem value="none" disabled>
                              {ecrIssuerAid ? 'No registries for this AID' : 'No registries available'}
                            </SelectItem>
                          ) : (
                            filteredRegistries.map((registry) => (
                              <SelectItem key={registry.registryId} value={registry.registryId}>
                                {registry.name} ({registry.issuerAid})
                              </SelectItem>
                            ))
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ecr-parent-le">Parent LE Credential</Label>
                    <Select
                      value={ecrParentLe}
                      onValueChange={setEcrParentLe}
                      disabled={issueEcrLoading}
                    >
                      <SelectTrigger id="ecr-parent-le">
                        <SelectValue placeholder="Select parent LE credential..." />
                      </SelectTrigger>
                      <SelectContent>
                        {credentials.filter(c => c.type === 'LE' && c.holder === ecrIssuerAid).length === 0 ? (
                          <SelectItem value="none" disabled>
                            {ecrIssuerAid ? `No LE credentials held by ${ecrIssuerAid}` : 'Select issuer AID first'}
                          </SelectItem>
                        ) : (
                          credentials.filter(c => c.type === 'LE' && c.holder === ecrIssuerAid).map((cred) => (
                            <SelectItem key={cred.said} value={cred.said}>
                              {cred.said.substring(0, 20)}... ({cred.lei})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleIssueECR}
                      disabled={issueEcrLoading || !ecrIssuerAid || !ecrHolderAid || !ecrRole || !ecrRegistry || !ecrParentLe}
                      className="w-full"
                    >
                      {issueEcrLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Issuing...
                        </>
                      ) : (
                        'Issue ECR Credential'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export Credentials
                    </CardTitle>
                    <CardDescription>
                      Download or save issued credentials to test-credentials/
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleListCredentials}
                    disabled={credentialsLoading === 'loading'}
                  >
                    {credentialsLoading === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {credentialsLoading === 'loading' && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {credentialsLoading === 'success' && credentials.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="mb-2">No credentials issued yet.</div>
                    <div className="text-sm">
                      Go to <strong>Issue Credentials</strong> tab to issue credentials.
                    </div>
                  </div>
                )}

                {credentialsLoading === 'success' && credentials.length > 0 && (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>SAID</TableHead>
                            <TableHead>LEI</TableHead>
                            <TableHead>Issued Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {credentials.map((cred) => (
                            <TableRow key={cred.said}>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    cred.type === 'QVI' ? 'bg-blue-500/10 text-blue-500' :
                                    cred.type === 'LE' ? 'bg-green-500/10 text-green-500' :
                                    'bg-purple-500/10 text-purple-500'
                                  }
                                >
                                  {cred.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {cred.said.substring(0, 24)}...
                              </TableCell>
                              <TableCell className="font-medium">
                                {cred.lei || 'N/A'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(cred.issued).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground font-mono">
                                {new Date(cred.issued).toLocaleTimeString('en-US', { hour12: false })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportCredential(cred.said, 'json')}
                                    title="Download JSON"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    JSON
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportCredential(cred.said, 'cesr')}
                                    title="Download CESR"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    CESR
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSaveToTestDir(cred)}
                                    title="Save to test-credentials/"
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg">
                      <strong>Export Options:</strong>
                      <ul className="mt-2 space-y-1 ml-4 list-disc">
                        <li><strong>Download JSON:</strong> Download credential as JSON file (credential.sad only)</li>
                        <li><strong>Download CESR:</strong> Download credential in CESR format (JSON + attachment)</li>
                        <li><strong>Save:</strong> Save both JSON and CESR formats to test-credentials/ directory with metadata</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
