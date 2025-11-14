/**
 * LEICCA vLEI Classifier - KERIA Infrastructure Detail Page
 *
 * Comprehensive documentation and management for KERIA (Key Event Receipt Infrastructure Agent)
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
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import { checkInfrastructureAction } from '../../actions';

export default function KERIADetailPage() {
  const router = useRouter();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Infrastructure', href: '/admin' },
    { label: 'KERIA', href: '/admin/infrastructure/keria' },
  ];

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsLoading(true);
    try {
      const status = await checkInfrastructureAction();
      setIsHealthy(status.keria);
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
                  <Server className="h-8 w-8" />
                  KERIA Agent
                </h1>
                <p className="text-responsive-sm text-muted-foreground mt-1">
                  Key Event Receipt Infrastructure Agent
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
              <CardTitle>What is KERIA?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                KERIA (Key Event Receipt Infrastructure Agent) is the core service that manages KERI identifiers (AIDs),
                witnesses, key events, and credential issuance. It acts as the central agent for all identity and credential operations.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">What does it do?</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Manages Autonomic Identifiers (AIDs) and key event logs (KELs)</li>
                  <li>Coordinates with witness network for key event validation</li>
                  <li>Issues and manages verifiable credentials (ACDC)</li>
                  <li>Maintains credential registries for issuers</li>
                  <li>Provides OOBI (Out-of-Band Introduction) resolution</li>
                  <li>Handles cryptographic operations and key management</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Ports, settings, and important configuration details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Network Ports</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">Main Agent</div>
                    <div className="font-mono text-lg font-semibold">3901</div>
                    <div className="text-xs text-muted-foreground mt-1">http://127.0.0.1:3901</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">OOBI Resolver</div>
                    <div className="font-mono text-lg font-semibold">3902</div>
                    <div className="text-xs text-muted-foreground mt-1">OOBI resolution endpoint</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">Boot Agent</div>
                    <div className="font-mono text-lg font-semibold">3903</div>
                    <div className="text-xs text-muted-foreground mt-1">http://127.0.0.1:3903</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Important Settings</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Passcode Length</div>
                    <div className="text-muted-foreground text-sm">
                      Must be exactly <span className="font-mono font-semibold">21 characters</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Use <code className="bg-background px-1 rounded">randomPasscode().padEnd(21, '_')</code>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Witness Configuration</div>
                    <div className="text-muted-foreground text-sm">
                      3 witnesses with threshold (toad) = 3
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      All 3 witnesses must sign key events
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Network</div>
                    <div className="text-muted-foreground text-sm">
                      Must be on <span className="font-mono">keri_network</span> Docker network
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Enables communication with witnesses and vLEI server
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTitle>Critical Configuration Notes</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>1. Passcode must remain consistent across sessions for the same agent</p>
                  <p>2. Changing passcode will create a new agent instance</p>
                  <p>3. Witness AIDs must be reachable before creating identifiers</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* How to Run */}
          <Card>
            <CardHeader>
              <CardTitle>How to Run</CardTitle>
              <CardDescription>
                Start KERIA using Docker and verify it's working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">1. Start KERIA Container</h4>
                <CodeBlock
                  code="cd /home/pieter/Development/mintBlue/vlei-trainings\ndocker compose up -d keria"
                  commandId="start-keria"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Verify Health Status</h4>
                <CodeBlock
                  code="curl http://localhost:3901/health"
                  commandId="check-health"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Expected response: HTTP 200 OK (even if empty body)
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Connect via signify-ts</h4>
                <CodeBlock
                  code={`import { ready, SignifyClient, Tier, randomPasscode } from 'signify-ts';

// REQUIRED: Call before using library
await ready();

// Create client
const bran = randomPasscode().padEnd(21, '_');
const client = new SignifyClient(
    'http://127.0.0.1:3901',  // Main agent
    bran,
    Tier.low,
    'http://127.0.0.1:3903'   // Boot agent
);

// Boot and connect
try {
    await client.connect();
} catch {
    await client.boot();
    await client.connect();
}

console.log('Connected to KERIA');`}
                  commandId="connect-signify"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Check Container Logs</h4>
                <CodeBlock
                  code="docker logs vlei-trainings-keria-1 --tail 50"
                  commandId="check-logs"
                />
              </div>
            </CardContent>
          </Card>

          {/* How to Configure */}
          <Card>
            <CardHeader>
              <CardTitle>How to Configure</CardTitle>
              <CardDescription>
                Configure witnesses and create AIDs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Witness Configuration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Default witness AIDs for vlei-trainings environment:
                </p>
                <CodeBlock
                  code={`const witnessIds = [
    'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha',  // Port 5642
    'BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM',  // Port 5643
    'BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX'   // Port 5644
];`}
                  commandId="witness-config"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Create AID with Witnesses</h4>
                <CodeBlock
                  code={`const result = await client.identifiers().create('my-identifier', {
    toad: witnessIds.length,  // Threshold = 3
    wits: witnessIds
});

// Wait for operation to complete
let op = await result.op();
while (!op.done) {
    await new Promise(r => setTimeout(r, 250));
    op = await client.operations().get(op.name);
}

const aidPrefix = op.response.i;
console.log('Created AID:', aidPrefix);`}
                  commandId="create-aid"
                />
              </div>

              <Alert>
                <AlertTitle>AID Naming Rules</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use lowercase letters and hyphens only</li>
                    <li>No spaces or special characters</li>
                    <li>Examples: 'qvi-issuer', 'entity-holder', 'test-aid-1'</li>
                  </ul>
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
                  <h4 className="font-semibold text-sm mb-2">Connection refused (ECONNREFUSED)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    KERIA container is not running or not accessible
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check if container is running: <code className="bg-muted px-1 rounded">docker ps | grep keria</code></li>
                      <li>Restart container: <code className="bg-muted px-1 rounded">docker compose restart keria</code></li>
                      <li>Check port binding: ensure 3901, 3902, 3903 are available</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Agent not found</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Need to boot agent first with the same passcode
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Call <code className="bg-muted px-1 rounded">client.boot()</code> before <code className="bg-muted px-1 rounded">client.connect()</code></li>
                      <li>Use the same 21-character passcode for existing agents</li>
                      <li>Check boot agent is accessible on port 3903</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Passcode validation error</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Passcode must be exactly 21 characters
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Use <code className="bg-muted px-1 rounded">randomPasscode().padEnd(21, '_')</code></li>
                      <li>Store passcode if you need to reconnect to same agent</li>
                      <li>Don't use special characters in padding</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Witness unreachable</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cannot connect to witness network during AID creation
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Ensure witness containers are running</li>
                      <li>Check KERIA and witnesses are on same Docker network</li>
                      <li>Verify witness AIDs are correct</li>
                      <li>Test witness health: <code className="bg-muted px-1 rounded">curl http://localhost:5642/health</code></li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Operation timeout</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Operations (create AID, issue credential) not completing
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Increase polling timeout (default 250ms)</li>
                      <li>Check witness network connectivity</li>
                      <li>Review KERIA logs for errors</li>
                      <li>Ensure all required services are running</li>
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
                  href="https://github.com/WebOfTrust/keria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">KERIA GitHub Repository</div>
                    <div className="text-sm text-muted-foreground">
                      Official KERIA source code and documentation
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://github.com/WebOfTrust/signify-ts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">signify-ts Client Library</div>
                    <div className="text-sm text-muted-foreground">
                      TypeScript/JavaScript client for KERIA
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://weboftrust.github.io/signify-ts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">signify-ts Documentation</div>
                    <div className="text-sm text-muted-foreground">
                      API reference and usage guides
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <div className="p-3 border border-border rounded-lg bg-muted/50">
                  <div className="font-medium">Local Quick Start Guide</div>
                  <div className="text-sm text-muted-foreground">
                    docs/01-RESEARCH/RT-4-QUICK-START.md
                  </div>
                </div>

                <div className="p-3 border border-border rounded-lg bg-muted/50">
                  <div className="font-medium">Complete signify-ts Guide</div>
                  <div className="text-sm text-muted-foreground">
                    docs/01-RESEARCH/RT-4-signify-ts-guide.md
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
