/**
 * LEICCA vLEI Classifier - vLEI Server Infrastructure Detail Page
 *
 * Comprehensive documentation and management for vLEI Schema Server
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
  Database,
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

export default function VLEIServerDetailPage() {
  const router = useRouter();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Infrastructure', href: '/admin' },
    { label: 'vLEI Server', href: '/admin/infrastructure/vlei-server' },
  ];

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    setIsLoading(true);
    try {
      const status = await checkInfrastructureAction();
      setIsHealthy(status.vleiServer);
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

  const schemas = [
    {
      name: 'QVI Schema',
      said: 'EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao',
      description: 'Qualified vLEI Issuer credential schema',
    },
    {
      name: 'LE Schema',
      said: 'ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY',
      description: 'Legal Entity vLEI credential schema',
    },
    {
      name: 'ECR Schema',
      said: 'EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw',
      description: 'Engagement Context Role credential schema',
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
                  <Database className="h-8 w-8" />
                  vLEI Server
                </h1>
                <p className="text-responsive-sm text-muted-foreground mt-1">
                  Schema Registry and OOBI Server
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
              <CardTitle>What is vLEI Server?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The vLEI Server is a schema registry and OOBI (Out-of-Band Introduction) server that hosts official
                vLEI credential schemas. It provides schema definitions required for credential issuance and verification.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">What does it do?</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Serves official vLEI credential schemas (QVI, LE, ECR)</li>
                  <li>Provides schema OOBIs for schema resolution</li>
                  <li>Hosts schema files in ACDC format</li>
                  <li>Enables schema verification during credential issuance</li>
                  <li>Supports schema discovery and retrieval</li>
                </ul>
              </div>

              <Alert>
                <AlertTitle>Schema Dependency</AlertTitle>
                <AlertDescription>
                  Both KERIA (for issuance) and the Python verifier (for verification) need to resolve schema
                  OOBIs from this server before working with vLEI credentials.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Port and available schemas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Network Port</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">HTTP Port</div>
                    <div className="font-mono text-lg font-semibold">7723</div>
                    <div className="text-xs text-muted-foreground mt-1">http://localhost:7723</div>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="text-sm text-muted-foreground">Schema Directory</div>
                    <div className="font-mono text-sm font-semibold">/vlei-server/schema/acdc</div>
                    <div className="text-xs text-muted-foreground mt-1">Container path to schemas</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Available Schemas</h4>
                <div className="space-y-3">
                  {schemas.map((schema) => (
                    <div key={schema.said} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{schema.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {schema.description}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground mt-2 break-all">
                            SAID: {schema.said}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground mt-1 break-all">
                            OOBI: http://localhost:7723/oobi/{schema.said}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(schema.said, `schema-${schema.name}`)}
                        >
                          {copiedCommand === `schema-${schema.name}` ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTitle>Schema SAIDs</AlertTitle>
                <AlertDescription>
                  Schema SAIDs (Self-Addressing Identifiers) are cryptographic hashes of the schema content.
                  They ensure schema integrity and immutability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* How to Run */}
          <Card>
            <CardHeader>
              <CardTitle>How to Run</CardTitle>
              <CardDescription>
                Start vLEI Server using Docker and verify schemas are accessible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">1. Start vLEI Server Container</h4>
                <CodeBlock
                  code="cd /home/pieter/Development/mintBlue/vlei-trainings\ndocker compose up -d vlei-server"
                  commandId="start-server"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">2. Verify Schema Access</h4>
                <p className="text-sm text-muted-foreground mb-2">Test QVI schema OOBI:</p>
                <CodeBlock
                  code="curl http://localhost:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao"
                  commandId="test-qvi"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Expected: JSON schema definition for QVI credential
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">3. Test All Schemas</h4>
                <CodeBlock
                  code={`# QVI Schema
curl http://localhost:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao

# LE Schema
curl http://localhost:7723/oobi/ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY

# ECR Schema
curl http://localhost:7723/oobi/EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw`}
                  commandId="test-all"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">4. Check Container Logs</h4>
                <CodeBlock
                  code="docker logs vlei-trainings-vlei-server-1 --tail 50"
                  commandId="check-logs"
                />
              </div>
            </CardContent>
          </Card>

          {/* How to Use Schemas */}
          <Card>
            <CardHeader>
              <CardTitle>How to Access Schemas</CardTitle>
              <CardDescription>
                Resolve schema OOBIs in KERIA and verifier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Resolve Schema OOBI in KERIA (signify-ts)</h4>
                <CodeBlock
                  code={`// Resolve QVI schema before issuing QVI credential
const schemaSaid = 'EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao';
const schemaOobi = \`http://vlei-server:7723/oobi/\${schemaSaid}\`;

const oobiResult = await client.oobis().resolve(schemaOobi, 'qvi-schema');

// Wait for resolution
let op = await oobiResult.op();
while (!op.done) {
    await new Promise(r => setTimeout(r, 250));
    op = await client.operations().get(op.name);
}

console.log('Schema resolved:', schemaSaid);`}
                  commandId="resolve-oobi"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Use Schema in Credential Issuance</h4>
                <CodeBlock
                  code={`// After resolving schema OOBI, use schema SAID in credential
const issueResult = await client.credentials().issue('issuer-aid', {
    ri: registryKey,
    s: 'EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao',  // QVI schema SAID
    a: {
        i: holderAidPrefix,
        LEI: '5493001KJTIIGC8Y1R17'
    }
});`}
                  commandId="use-schema"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Configure in Verifier</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Add schema OOBIs to verifier configuration (verifier-config-vlei-trainings.json):
                </p>
                <CodeBlock
                  code={`{
  "durls": [
    "http://vlei-server:7723/oobi/EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    "http://vlei-server:7723/oobi/ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY",
    "http://vlei-server:7723/oobi/EEy9PkikFcANV1l7EHukCeXqrzT1hNZjGlUk7wuMO5jw"
  ]
}`}
                  commandId="verifier-config"
                />
              </div>

              <Alert>
                <AlertTitle>Schema Resolution Required</AlertTitle>
                <AlertDescription>
                  Before issuing or verifying credentials, the schema OOBI MUST be resolved.
                  This allows KERIA/verifier to fetch and validate the schema definition.
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
                  <h4 className="font-semibold text-sm mb-2">Schema not found (404)</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Schema SAID is incorrect or schema not available
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Verify schema SAID is correct (check for typos)</li>
                      <li>Use official vLEI schema SAIDs listed above</li>
                      <li>Check vLEI server container is running</li>
                      <li>Test OOBI URL directly: <code className="bg-muted px-1 rounded">curl http://localhost:7723/oobi/SCHEMA_SAID</code></li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Connection refused</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cannot connect to vLEI server on port 7723
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check container is running: <code className="bg-muted px-1 rounded">docker ps | grep vlei-server</code></li>
                      <li>Verify port 7723 is available</li>
                      <li>Restart container: <code className="bg-muted px-1 rounded">docker compose restart vlei-server</code></li>
                      <li>Check container logs for errors</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Schema resolution timeout</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    KERIA/verifier cannot resolve schema OOBI
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Check network connectivity between services</li>
                      <li>Verify vLEI server is accessible from KERIA/verifier network</li>
                      <li>Use Docker service name in OOBI URL: <code className="bg-muted px-1 rounded">vlei-server</code></li>
                      <li>Test from within container: <code className="bg-muted px-1 rounded">docker exec keria curl http://vlei-server:7723/health</code></li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Invalid schema format</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Schema returned but not in expected format
                  </p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted-foreground">
                      <li>Ensure schema is valid ACDC format</li>
                      <li>Check schema has required fields (schema, credentialType, etc.)</li>
                      <li>Verify schema SAID matches content hash</li>
                      <li>Use official vLEI schemas from GLEIF repository</li>
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
                  href="https://github.com/WebOfTrust/vLEI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">vLEI Repository</div>
                    <div className="text-sm text-muted-foreground">
                      Official vLEI schemas and documentation
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://github.com/WebOfTrust/vLEI/tree/main/schema/acdc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">vLEI Schema Definitions</div>
                    <div className="text-sm text-muted-foreground">
                      QVI, LE, and ECR schema files
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>

                <a
                  href="https://trustoverip.github.io/tswg-acdc-specification/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">ACDC Specification</div>
                    <div className="text-sm text-muted-foreground">
                      Authentic Chained Data Container schema format
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
