/**
 * EncryptedCapsuleTab Component
 *
 * UI for decrypting and viewing audit capsule data from blockchain
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ScrollArea,
} from '@design-system-demo/design-system';
import { CheckCircle2, Copy, Download, Loader2, AlertTriangle, XCircle, Upload } from 'lucide-react';
import { decryptAuditCapsuleAction } from '@/app/audit/actions';
import type { DecryptionResult, DecryptionState, AuditCapsule, EvidenceFile } from '@/types/blockchain';
import { truncateHash, hashFile } from '@/lib/crypto-utils';

interface AuditEvent {
  id: string;
  type: 'verification' | 'classification' | 'anchoring';
  timestamp: string;
  data: Record<string, any>;
  txid?: string;
}

interface EncryptedCapsuleTabProps {
  event: AuditEvent;
  encryptedHex?: string;
  txid?: string;
}

export function EncryptedCapsuleTab({ event, encryptedHex, txid }: EncryptedCapsuleTabProps) {
  const [decryptionState, setDecryptionState] = useState<DecryptionState>('idle');
  const [decryptionResult, setDecryptionResult] = useState<DecryptionResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showFullHex, setShowFullHex] = useState(false);
  const [evidenceVerification, setEvidenceVerification] = useState<Record<string, {
    status: 'pending' | 'verified' | 'mismatch';
    computedHash?: string;
  }>>({});

  // Convert technical error messages to user-friendly ones
  const getUserFriendlyError = useCallback((error: string): string => {
    if (error.includes('key')) {
      return 'Decryption key not available. Please contact your administrator.';
    }
    if (error.includes('corrupted') || error.includes('invalid')) {
      return 'The encrypted data appears to be corrupted. Please try re-anchoring this event.';
    }
    if (error.includes('not initialized')) {
      return 'Blockchain service is not available. Please try again later.';
    }
    return error; // Fallback to original error
  }, []);

  // Comparison logic: Check if decrypted data matches displayed event data
  const verificationMatches = useCallback(() => {
    const decryptedVerification = decryptionResult?.capsule?.verification;
    const eventVerification = event.data?.verification || event.data?.details?.verification;

    if (!decryptedVerification || !eventVerification) return null; // Can't compare

    const decryptedLEI = (decryptedVerification as any).credential?.a?.LEI;
    const eventLEI = (eventVerification as any).credential?.lei || (eventVerification as any).credential?.LEI;

    return decryptedLEI === eventLEI;
  }, [decryptionResult, event]);

  const classificationMatches = useCallback(() => {
    const decryptedClassification = decryptionResult?.capsule?.classification;
    const eventClassification = event.data?.classificationData || event.data?.details?.classificationData;

    if (!decryptedClassification || !eventClassification) return null; // Can't compare

    return decryptedClassification.category === eventClassification.category;
  }, [decryptionResult, event]);

  /**
   * Decrypts the audit capsule using the blockchain anchoring service
   * @returns Promise that resolves when decryption completes
   */
  const handleDecrypt = useCallback(async () => {
    if (!encryptedHex || !txid) {
      return;
    }

    setDecryptionState('loading');

    try {
      const result = await decryptAuditCapsuleAction(txid, encryptedHex);
      setDecryptionResult(result);

      if (result.success) {
        setDecryptionState('success');
      } else {
        setDecryptionState('error');
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      setDecryptionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        decryptedAt: new Date().toISOString()
      });
      setDecryptionState('error');
    }
  }, [encryptedHex, txid]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Download raw binary file
  const handleDownloadRaw = useCallback(() => {
    if (!encryptedHex || !txid) return;

    try {
      const bytes = new Uint8Array(encryptedHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-capsule-${txid.slice(0, 16)}.bin`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download raw file:', error);
    }
  }, [encryptedHex, txid]);

  /**
   * Handles file upload and hash verification for evidence files
   * @param file - Evidence file metadata from capsule
   * @param fileIndex - Index of the file in the evidence array
   */
  const handleFileUpload = useCallback(async (file: EvidenceFile, fileIndex: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';

    input.onchange = async (e) => {
      const uploadedFile = (e.target as HTMLInputElement).files?.[0];
      if (!uploadedFile) return;

      // Set loading state
      setEvidenceVerification(prev => ({
        ...prev,
        [fileIndex]: { status: 'pending' }
      }));

      try {
        // Compute hash of uploaded file
        const computedHash = await hashFile(uploadedFile);

        // Compare with stored hash
        const matches = computedHash.toLowerCase() === file.hash.toLowerCase();

        setEvidenceVerification(prev => ({
          ...prev,
          [fileIndex]: {
            status: matches ? 'verified' : 'mismatch',
            computedHash
          }
        }));
      } catch (error) {
        console.error('Failed to hash file:', error);
        setEvidenceVerification(prev => ({
          ...prev,
          [fileIndex]: { status: 'mismatch', computedHash: 'Error computing hash' }
        }));
      }
    };

    input.click();
  }, []);

  /**
   * Downloads the decrypted capsule as a JSON file
   */
  const handleDownloadDecrypted = useCallback(() => {
    if (!decryptionResult?.capsule) return;

    try {
      const json = JSON.stringify(decryptionResult.capsule, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-capsule-decrypted-${txid || 'unknown'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download decrypted capsule:', error);
    }
  }, [decryptionResult, txid]);

  // Handle missing encryptedHex
  if (!encryptedHex || encryptedHex.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This audit event was created before encrypted capsule storage was implemented.
            Encrypted capsule data is only available for events anchored after blockchain integration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const capsule = decryptionResult?.capsule;

  return (
    <div className="space-y-4 mt-4">
      <p className="text-sm text-muted-foreground italic">
        Encrypted audit capsule containing verification, classification, and evidence data
      </p>

      {/* Section 1: Capsule Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Capsule Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Version</span>
              <div className="text-sm mt-1">{capsule?.version || '1.0.0'}</div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Protocol</span>
              <div className="text-sm mt-1 font-mono">mB:doc1</div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Encrypted Size</span>
              <div className="text-sm mt-1">{Math.floor(encryptedHex.length / 2).toLocaleString()} bytes</div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Record ID</span>
              <div className="text-sm mt-1 font-mono">{event.data?.recordId || 'N/A'}</div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Timestamp</span>
              <div className="text-sm mt-1">
                {new Date(event.timestamp).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Decryption Button & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decryption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleDecrypt}
            disabled={decryptionState === 'loading'}
            variant={decryptionState === 'success' ? 'outline' : 'default'}
            className="w-full"
            aria-label="Decrypt audit capsule"
          >
            {decryptionState === 'idle' && (
              <>
                <span className="mr-2">🔓</span>
                Decrypt Capsule
              </>
            )}
            {decryptionState === 'loading' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Decrypting...
              </>
            )}
            {decryptionState === 'success' && (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Decrypted Successfully
              </>
            )}
            {decryptionState === 'error' && (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Decryption Failed - Retry
              </>
            )}
          </Button>

          {decryptionState === 'loading' && (
            <Alert>
              <AlertDescription className="text-xs">
                Decrypting capsule from blockchain... This may take 10-15 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Screen reader announcements for status changes */}
          <div role="status" aria-live="polite" className="sr-only">
            {decryptionState === 'loading' && 'Decrypting capsule...'}
            {decryptionState === 'success' && 'Decryption complete'}
            {decryptionState === 'error' && 'Decryption failed'}
          </div>

          {decryptionState === 'error' && decryptionResult?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{getUserFriendlyError(decryptionResult.error)}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Decrypted Contents (Only show after success) */}
      {decryptionState === 'success' && capsule && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Decrypted Contents</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadDecrypted}
              aria-label="Download decrypted capsule as JSON"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Decrypted Capsule
            </Button>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {/* Verification Data Accordion */}
              {capsule.verification && (
                <AccordionItem value="verification">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>Verification Data</span>
                      {verificationMatches() !== null && (
                        <Badge variant={verificationMatches() ? 'default' : 'destructive'} className="text-xs">
                          {verificationMatches() ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Matches Verification tab
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Mismatch detected
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">LEI</span>
                          <div className="text-sm font-mono mt-1">
                            {(capsule.verification as any).credential?.a?.LEI || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Issued Date</span>
                          <div className="text-sm mt-1">
                            {(capsule.verification as any).credential?.a?.dt ? new Date((capsule.verification as any).credential.a.dt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Jurisdiction</span>
                          <div className="text-sm mt-1">
                            {(capsule.verification as any).jurisdiction || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Subject DID</span>
                          <div className="text-xs font-mono mt-1 break-all">
                            {(capsule.verification as any).credential?.a?.i ? truncateHash((capsule.verification as any).credential.a.i) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-primary hover:underline">
                          View Full JSON
                        </summary>
                        <pre className="mt-2 text-xs bg-muted/30 p-3 rounded overflow-auto max-h-64">
                          {JSON.stringify(capsule.verification, null, 2)}
                        </pre>
                      </details>

                      {/* Show mismatch details if verification doesn't match */}
                      {verificationMatches() === false && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            LEI mismatch: Capsule shows{' '}
                            {(capsule.verification as any).credential?.a?.LEI || 'N/A'}
                            , event shows{' '}
                            {(event.data?.verification?.credential?.lei || event.data?.verification?.credential?.LEI || 'N/A')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Classification Data Accordion */}
              {capsule.classification && (
                <AccordionItem value="classification">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>Classification Data</span>
                      {classificationMatches() !== null && (
                        <Badge variant={classificationMatches() ? 'default' : 'destructive'} className="text-xs">
                          {classificationMatches() ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Matches Classification tab
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Mismatch detected
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Basel CCR Category</span>
                          <div className="text-sm font-bold mt-1">
                            {capsule.classification.category || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Panel</span>
                          <div className="text-sm mt-1">{capsule.classification.panel || 'N/A'}</div>
                        </div>
                      </div>
                      {capsule.classification.decisionPath && Array.isArray(capsule.classification.decisionPath) && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-muted-foreground">Decision Path</span>
                          <ol className="list-decimal list-inside space-y-1 mt-2">
                            {capsule.classification.decisionPath.map((step: any, index: number) => (
                              <li key={index} className="text-xs">
                                <span className="text-muted-foreground">{step.question || step.nodeText}</span>
                                {' → '}
                                <span className="font-medium">{step.answer}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs text-primary hover:underline">
                          View Full JSON
                        </summary>
                        <pre className="mt-2 text-xs bg-muted/30 p-3 rounded overflow-auto max-h-64">
                          {JSON.stringify(capsule.classification, null, 2)}
                        </pre>
                      </details>

                      {/* Show mismatch details if classification doesn't match */}
                      {classificationMatches() === false && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Basel CCR mismatch: Capsule shows {capsule.classification.category}, event shows{' '}
                            {event.data?.classificationData?.category || event.data?.details?.classification || 'N/A'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Evidence Files Accordion */}
              {capsule.evidence && capsule.evidence.length > 0 && (
                <AccordionItem value="evidence">
                  <AccordionTrigger className="text-sm">
                    <div className="flex items-center gap-2">
                      <span>Evidence Files</span>
                      <Badge variant="secondary" className="text-xs">
                        {capsule.evidence.length} file{capsule.evidence.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <Alert>
                        <AlertDescription className="text-xs">
                          Evidence file hashes are stored in the blockchain capsule. Original files are not stored on-chain.
                          To verify file integrity, re-upload the file and compare its hash to the stored hash below.
                        </AlertDescription>
                      </Alert>
                      {capsule.evidence.map((file: EvidenceFile, index: number) => {
                        const verification = evidenceVerification[index];
                        const verificationStatus = verification?.status || 'pending';
                        return (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold font-mono">{file.filename}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {file.mimetype}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {file.size.toLocaleString()} bytes • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {verificationStatus === 'verified' ? (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Hash Match
                                  </Badge>
                                ) : verificationStatus === 'mismatch' ? (
                                  <Badge variant="destructive" className="text-xs">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Hash Mismatch
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Not Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="pt-2 border-t space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <span className="text-xs font-medium text-muted-foreground">Expected Hash (Stored On-Chain)</span>
                                  <code className="text-xs font-mono break-all block mt-1 bg-muted/30 p-2 rounded">
                                    {truncateHash(file.hash, 24)}
                                  </code>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(file.hash, `evidence-${index}`)}
                                  aria-label="Copy expected hash to clipboard"
                                >
                                  {copiedField === `evidence-${index}` ? (
                                    <>✓ Copied</>
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                              {verification?.computedHash && (
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <span className="text-xs font-medium text-muted-foreground">Computed Hash (From Uploaded File)</span>
                                    <code className={`text-xs font-mono break-all block mt-1 p-2 rounded ${
                                      verificationStatus === 'verified'
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-red-50 border border-red-200'
                                    }`}>
                                      {truncateHash(verification.computedHash, 24)}
                                    </code>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(verification.computedHash!, `computed-${index}`)}
                                    aria-label="Copy computed hash to clipboard"
                                  >
                                    {copiedField === `computed-${index}` ? (
                                      <>✓ Copied</>
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )}

                              <Button
                                variant={verificationStatus === 'pending' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFileUpload(file, index)}
                                className="w-full"
                                aria-label={`Upload file to verify ${file.filename}`}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {verificationStatus === 'pending' ? 'Upload to Verify' : 'Re-verify with Different File'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Temporal Proof Accordion */}
              {event.data?.temporalProof && (
                <AccordionItem value="temporal">
                  <AccordionTrigger className="text-sm">
                    Temporal Proof
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {event.data.temporalProof.verification?.kelState && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">KEL State</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Issuer DID</span>
                              <div className="font-mono text-xs mt-1 break-all bg-muted/30 p-2 rounded">
                                {event.data.temporalProof.verification.kelState.issuerDid || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Sequence Number</span>
                              <div className="font-mono text-sm mt-1">
                                {event.data.temporalProof.verification.kelState.sequenceNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {event.data.temporalProof.blockConfirmation && (
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-medium mb-2">Block Confirmation</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Block Height</span>
                              <div className="text-sm mt-1">
                                {event.data.temporalProof.blockConfirmation.blockHeight > 0
                                  ? event.data.temporalProof.blockConfirmation.blockHeight.toLocaleString()
                                  : 'Pending'}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Confirmations</span>
                              <div className="text-sm mt-1">
                                {event.data.temporalProof.blockConfirmation.confirmations || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Raw Encrypted Data (Always Available) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raw Encrypted Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Encrypted Hex Data {showFullHex ? '(Full)' : '(First 256 bytes)'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(encryptedHex, 'hex')}
                >
                  {copiedField === 'hex' ? (
                    <>✓ Copied</>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Hex
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadRaw}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Raw
                </Button>
              </div>
            </div>
            <ScrollArea className="h-32 w-full rounded-md border">
              <pre className="text-xs font-mono p-3 break-all whitespace-pre-wrap overflow-hidden">
                {showFullHex ? encryptedHex : encryptedHex.slice(0, 512)}
              </pre>
            </ScrollArea>
            {encryptedHex.length > 512 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullHex(!showFullHex)}
                className="mt-2 text-xs"
              >
                {showFullHex ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
