/**
 * LEICCA vLEI Classifier - Witnesses Infrastructure Detail Page
 *
 * Comprehensive documentation and management for KERI Witness Network
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
  Network,
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

export default function WitnessesDetailPage() {
  const router = useRouter();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Infrastructure', href: '/admin' },
    { label: 'Witnesses', href: '/admin/infrastructure/witnesses' },
  ];

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsLoading(true);
    try {
      const status = await checkInfrastructureAction();
      setIsHealthy(status.witnesses);
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

  const witnesses = [
    {
      name: 'Witness 1',
      port: 5642,
      aid: 'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha',
    },
    {
      name: 'Witness 2',
      port: 5643,
      aid: 'BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM',
    },
    {
      name: 'Witness 3',
      port: 5644,
      aid: 'BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX',
    },
  ];

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
                  <Network className="h-8 w-8" />
                  Witness Network
                </h1>
                <p className="text-responsive-sm text-muted-foreground mt-1">
                  KERI Witness Nodes for Key Event Validation
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
              <CardTitle>What are Witnesses?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Witnesses are KERI nodes that validate and store key events for identifiers. They provide redundancy,
                enable key recovery, and ensure the integrity of the key event log (KEL). Witnesses sign receipts for
                key events they validate.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">What do they do?</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Validate and sign key events (inception, rotation, interaction)</li>
                  <li>Store receipts for key events in the KEL</li>
                  <li>Provide redundancy for key event log storage</li>
                  <li>Enable key recovery through witness consensus</li>
                  <li>Prevent single points of failure in key management</li>
                  <li>Serve witness receipts to verifiers</li>
                </ul>
              </div>

              <Alert>
                <AlertTitle>Threshold (toad) = 3</AlertTitle>
                <AlertDescription>
                  In the vlei-trainings environment, all 3 witnesses must sign key events (threshold = 3).
                  This ensures maximum security but requires all witnesses to be available.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Witness network ports and AIDs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Witness Nodes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {witnesses.map((witness) => (
                    <div key={witness.port} className="p-4 border border-border rounded-lg">
                      <div className="font-medium mb-2">{witness.name}</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground">Port</div>
                          <div className="font-mono text-sm">{witness.port}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">AID Prefix</div>
                          <div className="font-mono text-xs break-all">{witness.aid}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">OOBI URL</div>
                          <div className="font-mono text-xs break-all">
                            http://localhost:{witness.port}/oobi/{witness.aid}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Threshold Configuration</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Witnesses</div>
                      <div className="font-mono text-2xl font-semibold">3</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Threshold (toad)</div>
                      <div className="font-mono text-2xl font-semibold">3</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Minimum Signatures</div>
                      <div className="font-mono text-2xl font-semibold">3</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    All 3 witnesses must sign key events for them to be valid
                  </p>
                </div>
              </div>

              <Alert>
                <AlertTitle>Witness AIDs are Fixed</AlertTitle>
                <AlertDescription>
                  The witness AIDs are pre-configured in the witness-demo container and cannot be changed
                  without rebuilding the witness network. These AIDs must match exactly when creating identifiers.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* How to Run */}
          <Card>
            <CardHeader>
              <CardTitle>How to Run</CardTitle>
              <CardDescription>
                Start witness network using Docker and verify connectivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">1. Start Witness Network</h4>
                <CodeBlock
                  code="cd /home/pieter/Development/mintBlue/vlei-trainings\ndocker compose up -d witness-demo"
                  commandId="start-witnesses"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This starts all 3 witness nodes in a single container
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Verify Each Witness</h4>
                <CodeBlock
                  code={`# Witness 1 (port 5642)
curl http://localhost:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha

# Witness 2 (port 5643)
curl http://localhost:5643/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM

# Witness 3 (port 5644)
curl http://localhost:5644/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX`}
                  commandId="verify-witnesses"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Each should return witness OOBI information
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Check Container Logs</h4>
                <CodeBlock
                  code="docker logs vlei-trainings-witness-demo-1 --tail 100"
                  commandId="check-logs"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Test Witness from KERIA</h4>
                <CodeBlock
                  code={`# From within KERIA container
docker exec vlei-trainings-keria-1 curl http://witness-demo:5642/health`}
                  commandId="test-from-keria"
                />
              </div>
            </CardContent>
          </Card>

          {/* How to Configure in AID Creation */}
          <Card>
            <CardHeader>
              <CardTitle>How to Configure Witnesses in AID Creation</CardTitle>
              <CardDescription>
                Use witnesses when creating identifiers in KERIA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Witness Configuration Array</h4>
                <CodeBlock
                  code={`const witnessIds = [
    'BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha',
    'BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM',
    'BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX'
];`}
                  commandId="witness-array"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Create AID with Witnesses (signify-ts)</h4>
                <CodeBlock
                  code={`const result = await client.identifiers().create('my-identifier', {
    toad: witnessIds.length,  // Threshold = 3 (all must sign)
    wits: witnessIds
});

// Wait for witness receipts
let op = await result.op();
while (!op.done) {
    await new Promise(r => setTimeout(r, 250));
    op = await client.operations().get(op.name);
}

console.log('AID created with witness signatures:', op.response.i);`}
                  commandId="create-aid-witnesses"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Verify Witness Receipts</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  After creating an AID, verify that all 3 witnesses signed the inception event:
                </p>
                <CodeBlock
                  code={`// Get identifier details
const identifier = await client.identifiers().get('my-identifier');

// Check witness receipts in KEL
const kel = identifier.state;
console.log('Witness receipts:', kel.witnessReceipts);
console.log('Expected: 3 receipts from all witnesses');`}
                  commandId="verify-receipts"
                />
              </div>

              <Alert>
                <AlertTitle>Threshold Must Match Witness Count</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>When using 3 witnesses with toad=3:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                    <li>All 3 witnesses must be reachable</li>
                    <li>All 3 must sign for key events to succeed</li>
                    <li>If any witness is down, AID creation will fail</li>
                  </ul>
                  <p className="mt-2">For more flexibility, use toad=2 (2-of-3 threshold).</p>
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
                  <h4 className="font-semibold text-sm mb-2">Witness not responding</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cannot connect to witness on expected port
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check container is running: <code className="bg-muted px-1 rounded">docker ps | grep witness</code></li>
                      <li>Verify ports 5642-5644 are available</li>
                      <li>Restart witness network: <code className="bg-muted px-1 rounded">docker compose restart witness-demo</code></li>
                      <li>Check container logs for errors</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Receipts not received</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AID creation succeeds but missing witness receipts
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check toad matches number of witnesses</li>
                      <li>Verify all witnesses are reachable from KERIA</li>
                      <li>Check witness AIDs are correct (no typos)</li>
                      <li>Ensure KERIA and witnesses are on same Docker network</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">AID creation timeout</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Operation never completes when creating AID
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Verify all 3 witnesses are running and healthy</li>
                      <li>Check network connectivity between KERIA and witnesses</li>
                      <li>Review KERIA logs for connection errors</li>
                      <li>Try reducing threshold to 2 for testing</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Wrong witness AIDs</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    AID creation fails with witness verification error
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Copy witness AIDs exactly from this page</li>
                      <li>Verify AIDs with: <code className="bg-muted px-1 rounded">curl http://localhost:5642/oobi/...</code></li>
                      <li>Check for leading/trailing whitespace</li>
                      <li>Ensure all 3 AIDs are in the wits array</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Network isolation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    KERIA cannot reach witnesses
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check KERIA and witnesses are on <code className="bg-muted px-1 rounded">keri_network</code></li>
                      <li>Inspect network: <code className="bg-muted px-1 rounded">docker network inspect keri_network</code></li>
                      <li>Test from KERIA: <code className="bg-muted px-1 rounded">docker exec keria curl http://witness-demo:5642/health</code></li>
                      <li>Verify docker-compose.yml network configuration</li>
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
                  href="https://github.com/WebOfTrust/keripy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">KERIpy Repository</div>
                    <div className="text-sm text-muted-foreground">
                      Python implementation of KERI (includes witness demo)
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://github.com/WebOfTrust/keri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">KERI Specification</div>
                    <div className="text-sm text-muted-foreground">
                      Key Event Receipt Infrastructure specification
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://github.com/WebOfTrust/keri/blob/main/docs/Witness.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">Witness Documentation</div>
                    <div className="text-sm text-muted-foreground">
                      Detailed witness operation and configuration guide
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
