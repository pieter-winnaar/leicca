/**
 * LEICCA vLEI Classifier - Verify Page
 *
 * Upload and verify vLEI credentials with SAID validation, QVI chain verification, and registry checks
 */

'use client';

import { useState } from 'react';
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
  FileUpload,
  Alert,
  AlertTitle,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@design-system-demo/design-system';
import { CheckCircle2, XCircle, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import { verifyCredentialAction } from './actions';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import { storeVerificationResult, storeCredentialFile } from '@/lib/workflow-storage';
import type { VerificationResultUI } from '@/types/vlei';

type VerificationState = 'idle' | 'loading' | 'success' | 'error' | 'revoked';

export default function VerifyPage() {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>('idle');
  const [result, setResult] = useState<VerificationResultUI | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Verify', href: '/verify' },
  ];

  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return;

    setState('loading');
    const file = files[0];

    try {
      const content = await file.text();
      const formData = new FormData();
      formData.append('credential', content);
      formData.append('filename', file.name);

      const verificationResult = await verifyCredentialAction(formData);
      setResult(verificationResult);

      // Update state based on verification result
      switch (verificationResult.status) {
        case 'verified':
          setState('success');
          // Store verification result and credential file for next steps
          storeVerificationResult(verificationResult);
          await storeCredentialFile(file);
          break;
        case 'revoked':
          setState('revoked');
          break;
        default:
          setState('error');
          break;
      }
    } catch (error) {
      setState('error');
      setResult({
        verified: false,
        status: 'invalid',
        credential: null,
        verification: null,
        errors: [error instanceof Error ? error.message : 'Verification failed'],
      });
    }
  }

  function handleReset() {
    setState('idle');
    setResult(null);
  }

  function handleNextClassify() {
    router.push('/classify');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-responsive-xl font-bold text-foreground mt-4">
            vLEI Credential Verification
          </h1>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Upload or paste a vLEI credential to verify its authenticity and validity
          </p>
        </div>

        {/* Input Section */}
        {(state === 'idle' || state === 'loading') && (
          <Card className="max-w-3xl mx-auto mb-8 fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Upload Credential
              </CardTitle>
              <CardDescription>
                Upload a .json or .cesr credential file for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <FileUpload
                  onFilesChange={handleFileUpload}
                  accept=".json,.cesr"
                  maxFiles={1}
                  maxSize={1024 * 1024} // 1MB
                  disabled={state === 'loading'}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Accepted formats: .json, .cesr (max 1MB)
                </p>
              </div>

              {/* Loading Overlay */}
              {state === 'loading' && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-sm text-muted-foreground">
                    Verifying credential...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {(state === 'success' || state === 'error' || state === 'revoked') && result && (
          <div className="max-w-3xl mx-auto space-y-6 fade-in">
            {/* Status Alert */}
            {state === 'success' && result.verified && (
              <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Credential Verified</AlertTitle>
                <AlertDescription>
                  Cryptographic verification passed. Credential SAID validated, signatures verified, and registry checked.
                </AlertDescription>
              </Alert>
            )}

            {state === 'success' && !result.verified && (
              <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Credential Parsed (Not Verified)</AlertTitle>
                <AlertDescription>
                  Credential parsed successfully. GLEIF data fetched. Cryptographic verification requires Python vLEI verifier (currently unavailable).
                </AlertDescription>
              </Alert>
            )}

            {state === 'revoked' && (
              <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Credential Revoked</AlertTitle>
                <AlertDescription>
                  This credential has been revoked and is no longer valid.
                </AlertDescription>
              </Alert>
            )}

            {state === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  The credential verification failed. See details below for specific validation errors.
                </AlertDescription>
              </Alert>
            )}

            {/* Verification Result Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Verification Result</CardTitle>
                  <Badge
                    variant={
                      state === 'success' ? 'default' : state === 'revoked' ? 'default' : 'destructive'
                    }
                    className={
                      state === 'success'
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                        : state === 'revoked'
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                        : ''
                    }
                  >
                    {state === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {state === 'revoked' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {state === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                    {result.status === 'verified' && 'Verified'}
                    {result.status === 'revoked' && 'Revoked'}
                    {result.status === 'invalid' && 'Invalid'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Credential Details */}
                {result.credential && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Credential Details</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">LEI</TableCell>
                          <TableCell className="font-mono text-sm">{result.credential.lei}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">Legal Name</TableCell>
                          <TableCell>{result.credential.legalName}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">Jurisdiction</TableCell>
                          <TableCell>{result.credential.jurisdiction}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">Issued</TableCell>
                          <TableCell>{result.credential.issuedDate}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">Expires</TableCell>
                          <TableCell>{result.credential.expiresDate}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground w-1/3">SAID</TableCell>
                          <TableCell className="font-mono text-xs break-all">
                            {result.credential.said}
                          </TableCell>
                        </TableRow>
                        {result.credential.personLegalName && (
                          <TableRow>
                            <TableCell className="font-medium text-muted-foreground w-1/3">Person Name</TableCell>
                            <TableCell>{result.credential.personLegalName}</TableCell>
                          </TableRow>
                        )}
                        {result.credential.engagementContextRole && (
                          <TableRow>
                            <TableCell className="font-medium text-muted-foreground w-1/3">Role</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{result.credential.engagementContextRole}</Badge>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Verification Details */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Verification Details</h3>
                  <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {result.verification?.saidValidation ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            SAID Validation: {result.verification?.saidValidation ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {!result.verification?.saidValidation && result.errors.length > 0 && (
                          <div className="ml-6 text-xs text-muted-foreground space-y-1">
                            {result.errors.map((err, idx) => (
                              <div key={idx}>{err}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {result.verification?.qviChain ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            QVI Chain: {result.verification?.qviChain ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                        {!result.verification?.qviChain && result.errors.length > 0 && (
                          <div className="ml-6 text-xs text-muted-foreground space-y-1">
                            {result.errors.filter(e => e.includes('QVI') || e.includes('ECR') || e.includes('Legal Entity')).map((err, idx) => (
                              <div key={idx}>{err}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {result.verification?.registryCheck ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Registry Check: {result.verification?.registryCheck ? 'Not Revoked' : 'Failed'}
                          </span>
                        </div>
                        {!result.verification?.registryCheck && result.errors.length > 0 && (
                          <div className="ml-6 text-xs text-muted-foreground">
                            {result.errors.filter(e => e.includes('revoked') || e.includes('registry')).map((err, idx) => (
                              <div key={idx}>{err}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      {result.verification?.timestamp && (
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Timestamp: {result.verification.timestamp}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    Verify Another
                  </Button>
                  {state === 'success' && (
                    <Button onClick={handleNextClassify} className="flex-1">
                      Next: Classify →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
