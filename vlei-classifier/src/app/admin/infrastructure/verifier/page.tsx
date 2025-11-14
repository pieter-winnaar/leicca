/**
 * LEICCA vLEI Classifier - Python vLEI Verifier Infrastructure Detail Page
 *
 * Comprehensive documentation and management for the Python vLEI Verifier service
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Breadcrumb,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@design-system-demo/design-system';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import { checkInfrastructureAction } from '../../actions';

export default function VerifierDetailPage() {
  const router = useRouter();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Infrastructure', href: '/admin' },
    { label: 'Verifier', href: '/admin/infrastructure/verifier' },
  ];

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsLoading(true);
    try {
      const status = await checkInfrastructureAction();
      setIsHealthy(status.verifier);
    } catch {
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function copyToClipboard(text: string, commandId: string) {
    await navigator.clipboard.writeText(text);
    setCopiedCommand(commandId);
    setTimeout(() => setCopiedCommand(null), 2000);
  }

  const CodeBlock = ({ code, commandId }: { code: string; commandId: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, commandId)}
      >
        {copiedCommand === commandId ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-responsive-xl font-bold text-foreground flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8" />
                  Python vLEI Verifier
                </h1>
                <p className="text-responsive-sm text-muted-foreground mt-1">
                  Cryptographic Verification Service
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={checkHealth}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Badge
                variant={isHealthy ? 'default' : 'destructive'}
                className={isHealthy ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
              >
                {isHealthy === null ? (
                  'Unknown'
                ) : isHealthy ? (
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
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>What is the Python vLEI Verifier?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Python vLEI Verifier is a cryptographic verification service that validates ACDC (Authentic Chained
                Data Containers) credentials, KEL (Key Event Log) events, and digital signatures. It ensures the integrity
                and authenticity of vLEI credentials.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">What does it do?</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Verifies ACDC credential signatures and SAIDs (Self-Addressing Identifiers)</li>
                  <li>Validates KEL events and key state consistency</li>
                  <li>Resolves credential schemas and edge credentials</li>
                  <li>Checks credential chain validity (QVI → LE → ECR)</li>
                  <li>Validates witness signatures and receipts</li>
                  <li>Verifies credential status (revoked, expired, etc.)</li>
                </ul>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Dependency</AlertTitle>
                <AlertDescription>
                  The verifier MUST be on the <code className="bg-background px-1 rounded">keri_network</code> Docker
                  network to reach KERIA and witness nodes. Without network connectivity, verification will fail.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Ports, environment variables, and configuration files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Network Port</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">HTTP API Port</div>
                    <div className="font-mono text-lg font-semibold">7676</div>
                    <div className="text-xs text-muted-foreground mt-1">http://localhost:7676</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">Docker Network</div>
                    <div className="font-mono text-lg font-semibold">keri_network</div>
                    <div className="text-xs text-muted-foreground mt-1">Required for witness/KERIA access</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Environment Variables</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-mono text-sm mb-1">VERIFIER_CONFIG_FILE</div>
                    <div className="text-muted-foreground text-sm">
                      Path to configuration JSON file
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Default: <code className="bg-background px-1 rounded">verifier-config-vlei-trainings.json</code>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-mono text-sm mb-1">VERIFIER_MODE</div>
                    <div className="text-muted-foreground text-sm">
                      Verification mode (test or production)
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Default: <code className="bg-background px-1 rounded">test</code> (for local development)
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-mono text-sm mb-1">VERIFY_ROOT_OF_TRUST</div>
                    <div className="text-muted-foreground text-sm">
                      Whether to verify against GLEIF root of trust
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Set to <code className="bg-background px-1 rounded">False</code> for local testing
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Configuration File Structure</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Location: <code className="bg-muted px-1 rounded">scripts/keri/cf/verifier-config-vlei-trainings.json</code>
                </p>
                <CodeBlock
                  code={`{
  "iurls": [
    "http://witness-demo:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha",
    "http://witness-demo:5643/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM",
    "http://witness-demo:5644/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX",
    "http://keria:3902/oobi"
  ],
  "durls": [
    "http://vlei-server:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    "http://vlei-server:7723/oobi/ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY",
    "http://vlei-server:7723/oobi/EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw"
  ]
}`}
                  commandId="config-structure"
                />
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p><span className="font-medium">iurls:</span> Identifier OOBIs (witnesses + KERIA)</p>
                  <p><span className="font-medium">durls:</span> Schema OOBIs (QVI, LE, ECR schemas)</p>
                </div>
              </div>

              <Alert>
                <AlertTitle>Network Connectivity Critical</AlertTitle>
                <AlertDescription>
                  All URLs in the config use Docker service names (witness-demo, keria, vlei-server).
                  The verifier container MUST be on the same network to resolve these names.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* How to Run */}
          <Card>
            <CardHeader>
              <CardTitle>How to Run</CardTitle>
              <CardDescription>
                Start the verifier using Docker and verify it's working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">1. Start Verifier Container</h4>
                <CodeBlock
                  code="cd /home/pieter/Development/mintBlue/vlei-verifier\ndocker compose up -d vlei-verifier"
                  commandId="start-verifier"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Verify Health Status</h4>
                <CodeBlock
                  code="curl http://localhost:7676/health"
                  commandId="check-health"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Expected response: <code className="bg-muted px-1 rounded">{`{"status": "healthy"}`}</code>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Test Verification</h4>
                <CodeBlock
                  code={`curl -X POST http://localhost:7676/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "credential": "YOUR_CESR_CREDENTIAL_HERE"
  }'`}
                  commandId="test-verify"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Replace <code className="bg-muted px-1 rounded">YOUR_CESR_CREDENTIAL_HERE</code> with actual CESR credential
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Check Container Logs</h4>
                <CodeBlock
                  code="docker logs vlei-verifier --tail 50 --follow"
                  commandId="check-logs"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">5. Verify Network Connectivity</h4>
                <CodeBlock
                  code={`# Check verifier is on keri_network
docker network inspect keri_network | grep vlei-verifier

# Test witness connectivity from inside container
docker exec vlei-verifier curl http://witness-demo:5642/health

# Test KERIA connectivity
docker exec vlei-verifier curl http://keria:3901/health`}
                  commandId="check-network"
                />
              </div>
            </CardContent>
          </Card>

          {/* How to Configure */}
          <Card>
            <CardHeader>
              <CardTitle>How to Configure</CardTitle>
              <CardDescription>
                Edit configuration and rebuild the verifier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">1. Edit Configuration File</h4>
                <CodeBlock
                  code="cd /home/pieter/Development/mintBlue/vlei-verifier\nnano scripts/keri/cf/verifier-config-vlei-trainings.json"
                  commandId="edit-config"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Add Custom Schema OOBI</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To verify credentials with custom schemas, add the schema OOBI to <code className="bg-muted px-1 rounded">durls</code>:
                </p>
                <CodeBlock
                  code={`{
  "durls": [
    ...existing schemas...,
    "http://vlei-server:7723/oobi/YOUR_SCHEMA_SAID"
  ]
}`}
                  commandId="add-schema"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Add Custom AID OOBI</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  To verify credentials from custom issuers, add the AID OOBI to <code className="bg-muted px-1 rounded">iurls</code>:
                </p>
                <CodeBlock
                  code={`{
  "iurls": [
    ...existing OOBIs...,
    "http://keria:3902/oobi/YOUR_AID_PREFIX"
  ]
}`}
                  commandId="add-oobi"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Rebuild and Restart</h4>
                <CodeBlock
                  code="docker compose build vlei-verifier\ndocker compose up -d vlei-verifier"
                  commandId="rebuild"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Required after any configuration changes
                </p>
              </div>

              <Alert>
                <AlertTitle>Configuration Changes Require Rebuild</AlertTitle>
                <AlertDescription>
                  The configuration file is baked into the Docker image at build time.
                  You MUST rebuild the image after editing the config file.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>
                Common issues and solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Unhealthy status</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Verifier cannot connect to KERIA or witnesses
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check KERIA is running: <code className="bg-muted px-1 rounded">docker ps | grep keria</code></li>
                      <li>Check witnesses are running: <code className="bg-muted px-1 rounded">docker ps | grep witness</code></li>
                      <li>Verify network: <code className="bg-muted px-1 rounded">docker network inspect keri_network</code></li>
                      <li>Check container logs for connection errors</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Schema not found</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Verifier cannot resolve credential schema
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Add schema OOBI to <code className="bg-muted px-1 rounded">durls</code> in config</li>
                      <li>Verify vLEI server is running on port 7723</li>
                      <li>Test schema OOBI: <code className="bg-muted px-1 rounded">curl http://localhost:7723/oobi/SCHEMA_SAID</code></li>
                      <li>Rebuild verifier after config changes</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Verification fails</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Credential verification returns error or invalid
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check credential format (valid CESR or JSON)</li>
                      <li>Verify credential SAID matches content hash</li>
                      <li>Ensure issuer AID OOBI is in <code className="bg-muted px-1 rounded">iurls</code></li>
                      <li>Check credential hasn't been tampered with</li>
                      <li>Verify credential chain (QVI → LE → ECR)</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Connection refused</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cannot connect to verifier on port 7676
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check container is running: <code className="bg-muted px-1 rounded">docker ps | grep vlei-verifier</code></li>
                      <li>Check port 7676 is not already in use</li>
                      <li>Restart container: <code className="bg-muted px-1 rounded">docker compose restart vlei-verifier</code></li>
                      <li>Check container logs for startup errors</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Network isolation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Verifier on wrong network, cannot reach other services
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check docker-compose.yml has <code className="bg-muted px-1 rounded">networks: [keri_network]</code></li>
                      <li>Inspect network: <code className="bg-muted px-1 rounded">docker network inspect keri_network</code></li>
                      <li>Recreate container on correct network</li>
                      <li>Ensure external network exists before starting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation Links</CardTitle>
              <CardDescription>
                External resources and references
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="https://github.com/GLEIF-IT/vlei-verifier"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">vlei-verifier GitHub Repository</div>
                    <div className="text-sm text-muted-foreground">
                      Official verifier source code and documentation
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://github.com/trustoverip/tswg-acdc-specification"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">ACDC Specification</div>
                    <div className="text-sm text-muted-foreground">
                      Authentic Chained Data Container specification
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <div className="p-3 border border-border rounded-lg bg-muted/50">
                  <div className="font-medium">Local Configuration</div>
                  <div className="text-sm text-muted-foreground">
                    /vlei-verifier/scripts/keri/cf/verifier-config-vlei-trainings.json
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
