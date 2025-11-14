/**
 * LEICCA vLEI Classifier - Anchor Page
 *
 * Create immutable audit trails for vLEI verification and classification evidence
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
  FileUpload,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Alert,
  AlertTitle,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@design-system-demo/design-system';
import { Anchor, CheckCircle2, Copy, ExternalLink, Loader2, X, FileText } from 'lucide-react';
import { anchorToBlockchainAction } from './actions';
import { hashFile, truncateHash } from '@/lib/crypto-utils';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import type { EvidenceFile, AnchoringResult } from '@/types/blockchain';
import type { VerificationResult, VerificationResultUI } from '@/types/vlei';
import type { ClassificationResult } from '@/types/decision-tree';
import { getVerificationResult, getVerificationResultUI, getClassificationResult, getCredentialFile, getEvidenceFiles, getScreenshot, clearWorkflowData } from '@/lib/workflow-storage';

type AnchorState = 'idle' | 'loading' | 'success' | 'error';

export default function AnchorPage() {
  const router = useRouter();
  const [state, setState] = useState<AnchorState>('idle');
  const [result, setResult] = useState<AnchoringResult | null>(null);

  // Workflow data from previous steps
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verificationUI, setVerificationUI] = useState<VerificationResultUI | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);

  // Form state
  const [evidenceType, setEvidenceType] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [timestamp] = useState(new Date().toISOString());

  // Load workflow data on mount
  useEffect(() => {
    async function loadWorkflowData() {
      const storedVerification = getVerificationResult();
      const storedVerificationUI = getVerificationResultUI();
      const storedClassification = getClassificationResult();
      const storedCredentialFile = await getCredentialFile();

      // Set verification and classification (these are required for blockchain anchoring)
      setVerification(storedVerification);
      setVerificationUI(storedVerificationUI);
      setClassification(storedClassification);

      // Pre-fill evidence type based on available data
      if (storedVerification && storedClassification) {
        setEvidenceType('combined'); // Both verification and classification available
      } else if (storedVerification) {
        setEvidenceType('verification'); // Only verification available
      } else if (storedClassification) {
        setEvidenceType('classification'); // Only classification available
      }

      // Pre-fill reference ID from LEI
      if (storedVerification?.credential?.a?.LEI) {
        setReferenceId(storedVerification.credential.a.LEI);
      }

      // Auto-load credential file and classification result as evidence
      const autoEvidenceFiles: File[] = [];

      // 1. Add credential file
      if (storedCredentialFile) {
        autoEvidenceFiles.push(storedCredentialFile);
      }

      // 2. Add classification result as JSON file
      if (storedClassification) {
        const classificationJson = JSON.stringify(storedClassification, null, 2);
        const classificationFile = new File(
          [classificationJson],
          'classification-result.json',
          { type: 'application/json' }
        );
        autoEvidenceFiles.push(classificationFile);
      }

      // 3. Add any manually uploaded evidence files from storage
      const storedEvidence = await getEvidenceFiles();
      autoEvidenceFiles.push(...storedEvidence);

      // 4. Add screenshot if available
      const storedScreenshot = getScreenshot();
      if (storedScreenshot) {
        // Convert dataUrl to File
        const response = await fetch(storedScreenshot.dataUrl);
        const blob = await response.blob();
        const screenshotFile = new File([blob], storedScreenshot.filename, { type: blob.type });
        autoEvidenceFiles.push(screenshotFile);
      }

      // Convert all files to EvidenceFile format with hashes
      if (autoEvidenceFiles.length > 0) {
        const evidenceWithHashes = await Promise.all(
          autoEvidenceFiles.map(async (file) => ({
            filename: file.name,
            size: file.size,
            mimetype: file.type,
            hash: await hashFile(file),
            uploadedAt: new Date().toISOString(),
          }))
        );
        setEvidenceFiles(evidenceWithHashes);
      }
    }

    loadWorkflowData();
  }, []);
  const [anchoringStep, setAnchoringStep] = useState<string>('');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Anchor', href: '/anchor' },
  ];

  /**
   * Handle file upload with hash computation
   */
  async function handleFileUpload(files: File[]) {
    if (files.length === 0) return;

    setAnchoringStep('Hashing evidence files...');

    // Add files with computed hashes
    const newFiles: EvidenceFile[] = [];
    for (const file of files) {
      const hash = await hashFile(file);
      newFiles.push({
        filename: file.name,
        size: file.size,
        mimetype: file.type,
        hash,
        uploadedAt: new Date().toISOString()
      });
    }

    setEvidenceFiles([...evidenceFiles, ...newFiles]);
    setAnchoringStep('');
  }

  function handleRemoveFile(index: number) {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  }

  function handleClearAll() {
    setEvidenceFiles([]);
  }

  /**
   * Anchor audit capsule to blockchain
   */
  async function handleAnchor() {
    if (evidenceFiles.length === 0) return;

    setState('loading');
    setResult(null);

    try {
      // Step 1: Creating audit capsule
      setAnchoringStep('Creating audit capsule...');
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay

      // Step 2: Encrypting payload
      setAnchoringStep('Encrypting payload with DocV1...');
      await new Promise(resolve => setTimeout(resolve, 500)); // UX delay

      // Step 3: Broadcasting transaction
      setAnchoringStep('Broadcasting transaction to blockchain...');

      const anchorResult = await anchorToBlockchainAction(
        verification,
        verificationUI,
        classification,
        evidenceFiles
      );

      // Step 4: Waiting for confirmation
      if (anchorResult.success) {
        setAnchoringStep('Waiting for confirmation...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay
      }

      setResult(anchorResult);

      if (anchorResult.success) {
        setState('success');
      } else {
        setState('error');
      }
    } catch (error) {
      setState('error');
      setResult({
        success: false,
        txid: null,
        basket: 'leicca-vlei-audit',
        timestamp: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Anchoring failed'],
      });
    } finally {
      setState(prev => prev); // Keep current state
      setAnchoringStep('');
    }
  }

  function handleReset() {
    setState('idle');
    setResult(null);
    setEvidenceType('');
    setReferenceId('');
    setDescription('');
    setEvidenceFiles([]);
  }

  function handleViewAudit() {
    router.push('/audit');
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-responsive-xl font-bold text-foreground mt-4">
            Anchor Evidence to Blockchain
          </h1>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            Create immutable audit trails for your vLEI verification and classification evidence
          </p>
        </div>

        {/* Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            {/* Left Column - Audit Capsule Builder */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  Build Audit Capsule
                </CardTitle>
                <CardDescription>
                  Define the evidence metadata for blockchain anchoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Evidence Type */}
                <div className="space-y-2">
                  <Label htmlFor="evidence-type">Evidence Type</Label>
                  <Select value={evidenceType} onValueChange={setEvidenceType}>
                    <SelectTrigger id="evidence-type">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verification">vLEI Verification</SelectItem>
                      <SelectItem value="classification">Basel Classification</SelectItem>
                      <SelectItem value="combined">Combined Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference ID */}
                <div className="space-y-2">
                  <Label htmlFor="reference-id">Reference ID</Label>
                  <Input
                    id="reference-id"
                    placeholder="e.g., LEI or SAID"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    disabled={state === 'loading'}
                  />
                  <p className="text-xs text-muted-foreground">
                    LEI, SAID, or other identifier
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional notes about this evidence..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={state === 'loading'}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Timestamp */}
                <div className="space-y-2">
                  <Label>Timestamp</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {new Date(timestamp).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Middle Column - Evidence Files */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Add Evidence Files</CardTitle>
                <CardDescription>
                  Upload JSON evidence files (max 10 files, 10MB each)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <FileUpload
                  onFilesChange={handleFileUpload}
                  accept=".json,.cesr"
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024} // 10MB
                  disabled={state === 'loading'}
                />

                {/* Uploaded Files List */}
                {evidenceFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Files ({evidenceFiles.length})
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        disabled={state === 'loading'}
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {evidenceFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 border border-border rounded-lg bg-accent/30"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(file.size)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs font-mono text-muted-foreground truncate">
                                {truncateHash(file.hash)}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(file.hash)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveFile(index)}
                            disabled={state === 'loading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Anchor Button */}
                <Button
                  onClick={handleAnchor}
                  disabled={state === 'loading' || evidenceFiles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {state === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {anchoringStep || 'Anchoring...'}
                    </>
                  ) : (
                    <>
                      <Anchor className="h-4 w-4 mr-2" />
                      Anchor to Blockchain
                    </>
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* Right Column - Anchoring Result (always visible) */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Anchoring Result</CardTitle>
                  {state === 'success' && (
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Anchored
                    </Badge>
                  )}
                  {state === 'loading' && (
                    <Badge variant="outline">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing
                    </Badge>
                  )}
                </div>
                {state === 'idle' && (
                  <CardDescription>
                    Transaction details will appear here after anchoring
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Idle State */}
                {state === 'idle' && (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm italic">
                    No anchoring result yet
                  </div>
                )}

                {/* Loading State */}
                {state === 'loading' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-accent/30">
                      <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{anchoringStep || 'Processing...'}</p>
                        <p className="text-xs text-muted-foreground">
                          Creating audit capsule and broadcasting to blockchain
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center italic">
                      This may take 10-30 seconds
                    </p>
                  </div>
                )}

                {/* Success State */}
                {state === 'success' && result && (
                  <div className="space-y-4">
                    <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>Successfully Anchored</AlertTitle>
                      <AlertDescription>
                        Evidence anchored to blockchain. Transaction is immutable and publicly verifiable.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Transaction Details</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium text-muted-foreground w-1/3">TXID</TableCell>
                            <TableCell className="font-mono text-xs">
                              <div className="flex items-center gap-2">
                                <span className="truncate">{truncateHash(result.txid || '')}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => navigator.clipboard.writeText(result.txid || '')}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-muted-foreground w-1/3">Basket</TableCell>
                            <TableCell className="font-mono text-sm">{result.basket}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-muted-foreground w-1/3">Timestamp</TableCell>
                            <TableCell className="text-sm">
                              {new Date(result.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                          {result.explorerUrl && (
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground w-1/3">Explorer</TableCell>
                              <TableCell>
                                <a
                                  href={result.explorerUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  View on WhatsOnChain
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                      <Button onClick={handleViewAudit} className="w-full">
                        View in Audit Timeline →
                      </Button>
                      <Button variant="outline" onClick={handleReset} className="w-full">
                        Anchor More Evidence
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {state === 'error' && result && (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTitle>Anchoring Failed</AlertTitle>
                      <AlertDescription>
                        {result.errors && result.errors.length > 0 ? result.errors.join(', ') : 'Unable to anchor evidence to blockchain.'}
                      </AlertDescription>
                    </Alert>
                    <Button variant="outline" onClick={handleReset} className="w-full">
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
