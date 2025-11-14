/**
 * EventDetailsModal Component
 * Comprehensive modal with 5-tab structure for all audit events
 *
 * Captures event data on mount to completely isolate from parent re-renders
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@design-system-demo/design-system';
import { CheckCircle2, XCircle, Copy, Download } from 'lucide-react';
import { truncateHash } from '@/lib/crypto-utils';
import { getScreenshot } from '@/lib/workflow-storage';
import { EncryptedCapsuleTab } from './EncryptedCapsuleTab';

interface AuditEvent {
  id: string;
  type: 'verification' | 'classification' | 'anchoring';
  timestamp: string;
  referenceId: string;
  description: string;
  data: Record<string, any>;
  txid?: string;
  details: {
    lei?: string;
    said?: string;
    txid?: string;
    blockHeight?: number;
    classification?: string;
    files?: string[];
    status?: string;
    basket?: string;
    recordId?: string;
    evidenceCount?: number;
    jurisdiction?: string;
    encryptedHex?: string; // DocV1 encrypted OP_RETURN hex
    verification?: any; // Full verification data
    classificationData?: any; // Full classification data
    temporalProof?: any; // Temporal proof with KEL state and block confirmation
  };
}

export function EventDetailsModal({
  eventId,
  events,
  onClose,
  getEntityName,
}: {
  eventId: string;
  events: AuditEvent[];
  onClose: () => void;
  getEntityName: (event: AuditEvent) => string;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modal manages its own blockchain state (fetched once on mount)
  const [modalCurrentHeight, setModalCurrentHeight] = useState<number>(0);
  const [modalEventBlockHeight, setModalEventBlockHeight] = useState<number>(0);
  const hasFetchedRef = React.useRef(false);

  // Capture event data ONCE on mount - this prevents re-renders when parent updates
  const eventRef = React.useRef<AuditEvent | null>(null);
  if (!eventRef.current) {
    eventRef.current = events.find(e => e.id === eventId) || null;
  }
  const event = eventRef.current;

  if (!event) {
    onClose();
    return null;
  }

  // Fetch blockchain data once when modal opens
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Fetch current height
    fetch('/api/blockchain/current-height')
      .then(res => res.json())
      .then(data => setModalCurrentHeight(data.height || 0))
      .catch(err => console.error('Modal: Failed to fetch current height:', err));

    // Fetch event block height if txid exists
    if (event.details.txid) {
      fetch('/api/transaction-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txid: event.details.txid })
      })
        .then(res => res.json())
        .then(data => setModalEventBlockHeight(data.blockHeight || 0))
        .catch(err => console.error('Modal: Failed to fetch event block height:', err));
    }
  }, []);

  const copyToClipboardWithFeedback = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // DownloadButton component with live SPV proof fetching
  const DownloadButton = ({ event, type, label, description }: { event: AuditEvent; type: string; label: string; description: string }) => {
    const handleDownload = async () => {
      setDownloadingType(type);

      // Fetch live confirmation and Merkle proof
      let liveConfirmation = null;
      let merkleProof = null;
      if (event.details.txid) {
        try {
          const statusResponse = await fetch('/api/transaction-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid: event.details.txid })
          });
          if (statusResponse.ok) {
            const status = await statusResponse.json();
            liveConfirmation = {
              blockHeight: status.blockHeight || 0,
              confirmations: status.confirmations || 0,
              confirmed: status.confirmed || false,
              checkedAt: new Date().toISOString()
            };
          }

          if (liveConfirmation?.blockHeight && liveConfirmation.blockHeight > 0) {
            const proofResponse = await fetch('/api/merkle-proof', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ txid: event.details.txid })
            });
            if (proofResponse.ok) {
              merkleProof = await proofResponse.json();
            }
          }
        } catch (err) {
          console.error('Error fetching blockchain data:', err);
        }
      }

      const displayConfirmation = liveConfirmation || event.details.temporalProof?.blockConfirmation;

      switch (type) {
        case 'complete':
          const completePackage = {
            packageType: 'Complete-Audit-Package',
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            credential: event.details.verification || { lei: event.details.lei, jurisdiction: event.details.jurisdiction, verifiedAt: event.timestamp, said: event.details.said },
            classification: event.details.classificationData || { category: event.details.classification, lei: event.details.lei },
            blockchainProof: merkleProof ? {
              txid: event.details.txid,
              blockHeight: displayConfirmation?.blockHeight || 0,
              confirmations: displayConfirmation?.confirmations || 0,
              confirmedAt: displayConfirmation?.checkedAt || new Date().toISOString(),
              basket: event.details.basket,
              recordId: event.details.recordId,
              spvProof: {
                merkleRoot: merkleProof.merkleRoot,
                path: merkleProof.path,
                index: merkleProof.index,
                note: 'SPV Merkle proof verifies transaction inclusion in block'
              }
            } : event.details.txid ? {
              txid: event.details.txid,
              blockHeight: displayConfirmation?.blockHeight || 0,
              confirmations: displayConfirmation?.confirmations || 0,
              confirmedAt: displayConfirmation?.checkedAt || new Date().toISOString(),
              basket: event.details.basket,
              recordId: event.details.recordId,
              note: 'Transaction not yet confirmed or Merkle proof unavailable'
            } : null,
            temporalProof: event.details.temporalProof ? {
              kelState: event.details.temporalProof.verification?.kelState,
              verification: {
                method: 'KEL-state-anchoring-to-BSV-blockchain',
                description: 'Cryptographic proof of credential validity at specified timestamp',
                timestamp: event.details.temporalProof.createdAt
              }
            } : null
          };
          downloadFile(JSON.stringify(completePackage, null, 2), `complete-audit-${event.details.lei || event.id}.json`);
          break;

        case 'credential':
          if (event.details.verification) {
            downloadFile(JSON.stringify(event.details.verification, null, 2), `credential-${event.details.lei || event.id}.json`);
          }
          break;

        case 'classification':
          if (event.details.classificationData) {
            downloadFile(JSON.stringify(event.details.classificationData, null, 2), `classification-${event.details.lei || event.id}.json`);
          }
          break;

        case 'blockchain':
          const blockchainProof = merkleProof ? {
            proofType: 'Blockchain-SPV-Proof',
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            transaction: {
              txid: event.details.txid,
              blockHeight: displayConfirmation?.blockHeight || 0,
              confirmations: displayConfirmation?.confirmations || 0,
              confirmedAt: displayConfirmation?.checkedAt || new Date().toISOString(),
              basket: event.details.basket,
              recordId: event.details.recordId
            },
            spvProof: {
              merkleRoot: merkleProof.merkleRoot,
              path: merkleProof.path,
              index: merkleProof.index,
              verification: 'Use this Merkle proof to independently verify transaction inclusion in the block'
            }
          } : {
            proofType: 'Blockchain-Transaction-Info',
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            transaction: {
              txid: event.details.txid,
              blockHeight: displayConfirmation?.blockHeight || 0,
              confirmations: displayConfirmation?.confirmations || 0,
              confirmedAt: displayConfirmation?.checkedAt || new Date().toISOString(),
              basket: event.details.basket,
              recordId: event.details.recordId
            },
            note: 'Transaction not yet confirmed or Merkle proof unavailable. Check back after 6 confirmations.'
          };
          downloadFile(JSON.stringify(blockchainProof, null, 2), `blockchain-proof-${event.details.lei || event.id}.json`);
          break;

        case 'temporal':
          const temporalPackage = {
            proofType: 'Temporal-Proof',
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            kelState: event.details.temporalProof?.verification?.kelState,
            blockchainAnchor: {
              txid: event.details.txid,
              blockHeight: displayConfirmation?.blockHeight || 0,
              confirmations: displayConfirmation?.confirmations || 0,
              confirmedAt: displayConfirmation?.checkedAt || new Date().toISOString()
            },
            verification: {
              method: 'KEL-state-anchoring-to-BSV-blockchain',
              description: 'This proof establishes that the credential was valid at the timestamp when the KEL state was anchored to the blockchain',
              timestamp: event.details.temporalProof?.createdAt
            }
          };
          downloadFile(JSON.stringify(temporalPackage, null, 2), `temporal-proof-${event.details.lei || event.id}.json`);
          break;
      }

      setDownloadingType(null);
    };

    return (
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={handleDownload}
        disabled={downloadingType === type}
      >
        <Download className="h-4 w-4 mr-2" />
        <div className="flex-1 text-left">
          <div className="font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        {downloadingType === type && <span className="text-xs">Downloading...</span>}
      </Button>
    );
  };

  // Common variables
  const verification = event.details.verification;
  const classificationData = event.details.classificationData;
  const temporalProof = event.details.temporalProof;
  const kelState = temporalProof?.verification?.kelState;
  const txid = event.details.txid;
  const blockHeight = modalEventBlockHeight;
  const confirmations = blockHeight > 0 && modalCurrentHeight > 0
    ? Math.max(0, modalCurrentHeight - blockHeight + 1)
    : 0;
  const confirmed = confirmations >= 6;
  const entityName = getEntityName(event);

  const getEventTypeIcon = () => {
    switch (event.type) {
      case 'verification':
        return '✓';
      case 'classification':
        return '📋';
      case 'anchoring':
        return '⚓';
      default:
        return '•';
    }
  };

  const getStatusBadge = () => {
    const badges = [];
    if (verification) badges.push(<Badge key="verified" variant="default">Verified</Badge>);
    if (classificationData) badges.push(<Badge key="classified" variant="secondary">Classified</Badge>);
    if (txid && confirmed) badges.push(<Badge key="anchored" variant="default">Anchored</Badge>);
    if (txid && !confirmed) badges.push(<Badge key="pending" variant="outline">Anchoring Pending</Badge>);
    return badges;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{getEventTypeIcon()}</span>
            <span>Audit Event Details</span>
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            {new Date(event.timestamp).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="classification">Classification</TabsTrigger>
            <TabsTrigger value="anchoring">Anchoring</TabsTrigger>
            <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
          </TabsList>

          {/* 1. Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground italic">
              Summary of this audit event
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Event Type</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm capitalize">{event.type}</span>
                      <Badge variant="secondary">{getEventTypeIcon()}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Entity Name</span>
                    <div className="text-sm mt-1">{entityName}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">LEI</span>
                    <div className="text-sm font-mono mt-1">{event.details.lei || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Jurisdiction</span>
                    <div className="text-sm mt-1">{event.details.jurisdiction || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Timestamp</span>
                    <div className="text-sm mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <span className="text-xs font-medium text-muted-foreground">Description</span>
                  <p className="text-sm mt-1">{event.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Verification Tab */}
          <TabsContent value="verification" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground italic">
              Cryptographic verification of the vLEI credential against GLEIF infrastructure
            </p>
            {verification ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Credential Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">LEI</span>
                        <div className="text-sm font-mono mt-1">{event.details.lei || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Legal Name</span>
                        <div className="text-sm mt-1">{verification.credential?.legalName || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Jurisdiction</span>
                        <div className="text-sm mt-1">{event.details.jurisdiction || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Issued Date</span>
                        <div className="text-sm mt-1">
                          {verification.credential?.issuanceDate
                            ? new Date(verification.credential.issuanceDate).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </div>
                      {verification.credential?.personLegalName && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Person Name</span>
                          <div className="text-sm mt-1">{verification.credential.personLegalName}</div>
                        </div>
                      )}
                      {verification.credential?.engagementContextRole && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Role</span>
                          <div className="text-sm mt-1">
                            <Badge variant="secondary">{verification.credential.engagementContextRole}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    {event.details.said && (
                      <div className="pt-3 border-t">
                        <span className="text-xs font-medium text-muted-foreground">SAID</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono break-all flex-1 bg-muted/30 p-2 rounded">
                            {event.details.said}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboardWithFeedback(event.details.said!, 'said')}
                          >
                            {copiedField === 'said' ? '✓' : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Verification Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.details.verification?.verification ? (
                      <>
                        <div className="flex items-center gap-2">
                          {event.details.verification.verification.saidValidation ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            SAID Validation: {event.details.verification.verification.saidValidation ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.details.verification.verification.qviChain ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            QVI Chain: {event.details.verification.verification.qviChain ? 'Valid' : 'Invalid'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.details.verification.verification.registryCheck ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">
                            Registry Check: {event.details.verification.verification.registryCheck ? 'Not Revoked' : 'Failed'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No verification data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {kelState && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">KEL State</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Issuer DID</span>
                        <div className="font-mono text-xs mt-1 break-all bg-muted/30 p-2 rounded">
                          {kelState.issuerDid || 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Sequence Number</span>
                          <div className="font-mono text-sm mt-1">{kelState.sequenceNumber || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Last Event SAID</span>
                          <div className="font-mono text-xs mt-1 truncate" title={kelState.lastEventSaid}>
                            {kelState.lastEventSaid ? truncateHash(kelState.lastEventSaid, 8, 8) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Link to Encrypted Capsule tab */}
                {event.details.encryptedHex && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setActiveTab('encrypted')}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View in Encrypted Capsule →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No verification data for this event</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 3. Classification Tab */}
          <TabsContent value="classification" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground italic">
              Regulatory classification based on Basel Committee on Banking Supervision counterparty credit risk rules
            </p>
            {classificationData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Classification Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Basel CCR Category</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold">{event.details.classification || classificationData.category || 'N/A'}</span>
                        {classificationData.confidence && (
                          <Badge variant={classificationData.confidence > 0.8 ? 'default' : 'secondary'}>
                            {Math.round(classificationData.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                    </div>
                    {event.details.lei && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Entity LEI</span>
                        <div className="text-sm font-mono mt-1">{event.details.lei}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {classificationData.decisionPath && Array.isArray(classificationData.decisionPath) && classificationData.decisionPath.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Decision Path</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <ol className="list-decimal list-inside space-y-2">
                          {classificationData.decisionPath.map((step: any, index: number) => (
                            <li key={index} className="text-sm">
                              <span className="font-mono text-xs text-muted-foreground">
                                {step.nodeId}
                              </span>
                              {' - '}
                              <span className="text-muted-foreground">
                                {step.nodeText || step.question || (typeof step === 'string' ? step : JSON.stringify(step))}
                              </span>
                              {' → '}
                              <span className="font-medium">{step.answer}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {classificationData.answers && classificationData.answers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Questionnaire Answers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {classificationData.answers.map((qa: any, index: number) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-sm">
                              {qa.question || `Question ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm text-muted-foreground">
                                {qa.answer || 'No answer provided'}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}

                {classificationData.screenshot && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evidence Screenshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Filename</span>
                        <div className="text-sm font-mono mt-1">{classificationData.screenshot.filename}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">SHA-256 Hash</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs font-mono break-all flex-1 bg-muted/30 p-2 rounded">
                            {classificationData.screenshot.hash}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboardWithFeedback(classificationData.screenshot.hash, 'screenshot-hash')}
                          >
                            {copiedField === 'screenshot-hash' ? '✓' : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          const screenshot = getScreenshot();
                          if (screenshot) {
                            const link = document.createElement('a');
                            link.href = screenshot.dataUrl;
                            link.download = screenshot.filename;
                            link.click();
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Screenshot
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Link to Encrypted Capsule tab */}
                {event.details.encryptedHex && (
                  <div className="pt-4 border-t">
                    <button
                      onClick={() => setActiveTab('encrypted')}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View in Encrypted Capsule →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No classification data for this event</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 4. Anchoring Tab */}
          <TabsContent value="anchoring" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground italic">
              Immutable audit trail anchored to BSV blockchain with temporal proof of credential validity
            </p>
            {txid ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Transaction ID</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs font-mono break-all flex-1 bg-muted/30 p-2 rounded">
                          {txid}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboardWithFeedback(txid, 'txid')}
                        >
                          {copiedField === 'txid' ? '✓' : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {blockHeight > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Block Height</span>
                          <div className="text-sm font-mono mt-1">{blockHeight.toLocaleString()}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Confirmations</span>
                        <div className="text-sm font-mono mt-1">{confirmations}</div>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <a
                        href={`https://whatsonchain.com/tx/${txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        View on WhatsOnChain Explorer
                        <span>→</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Temporal Proof</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {kelState && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">KEL State</h4>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Issuer DID</span>
                          <div className="font-mono text-xs mt-1 break-all bg-muted/30 p-2 rounded">
                            {kelState.issuerDid || 'N/A'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Sequence Number</span>
                            <div className="font-mono text-sm mt-1">{kelState.sequenceNumber || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Last Event SAID</span>
                            <div className="font-mono text-xs mt-1 truncate" title={kelState.lastEventSaid}>
                              {kelState.lastEventSaid ? truncateHash(kelState.lastEventSaid, 8, 8) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-sm font-medium">Block Confirmation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Block Height</span>
                          <div className="text-sm mt-1">
                            {blockHeight > 0 ? blockHeight.toLocaleString() : 'Pending'}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">Confirmed</span>
                          <div className="text-sm mt-1">
                            {confirmed ? '✓ Yes' : '⏳ Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {event.details.files && event.details.files.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evidence Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {event.details.files.map((file, index) => (
                          <div key={index} className="text-sm font-mono bg-muted/30 p-2 rounded">
                            {file}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No blockchain anchoring for this event</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 5. Encrypted Capsule Tab */}
          <TabsContent value="encrypted" className="space-y-4 mt-4">
            <EncryptedCapsuleTab
              event={event}
              encryptedHex={event.details.encryptedHex}
              txid={event.details.txid}
            />
          </TabsContent>

          {/* 6. Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground italic">
              Download complete audit packages with cryptographic proofs in JSON format
            </p>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Packages</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  All packages include live blockchain confirmation status and SPV Merkle proofs when available
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <DownloadButton
                  event={event}
                  type="complete"
                  label="Complete Audit Package"
                  description="Full audit trail with verification, classification, blockchain proof, and temporal proof"
                />

                {verification && (
                  <DownloadButton
                    event={event}
                    type="credential"
                    label="vLEI Credential Data"
                    description="Verified credential information and KEL state"
                  />
                )}

                {classificationData && (
                  <DownloadButton
                    event={event}
                    type="classification"
                    label="Basel CCR Classification"
                    description="Classification result with decision path"
                  />
                )}

                {txid && (
                  <DownloadButton
                    event={event}
                    type="blockchain"
                    label="Blockchain SPV Proof"
                    description="Transaction details with Merkle proof for independent verification"
                  />
                )}

                {temporalProof && (
                  <DownloadButton
                    event={event}
                    type="temporal"
                    label="Temporal Proof Package"
                    description="KEL state anchored to blockchain proving credential validity at timestamp"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
