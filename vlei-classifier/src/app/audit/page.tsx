/**
 * LEICCA vLEI Classifier - Audit Page
 *
 * View all verification, classification, and anchoring events in timeline or table view
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Breadcrumb,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
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
import { CheckCircle2, XCircle, FileText, Anchor, AlertTriangle, ChevronDown, Copy, Search, RotateCcw, List, Clock, Download, Image, Eye, ExternalLink } from 'lucide-react';
import { getAuditEventsAction } from './actions';
import { truncateHash } from '@/lib/crypto-utils';
import { getScreenshot } from '@/lib/workflow-storage';
import type { BreadcrumbItem } from '@design-system-demo/design-system';
import { EventDetailsModal } from '@/components/EventDetailsModal';
import { AuditTrailStatusBar } from '@/components/AuditTrailStatusBar';

type ViewMode = 'timeline' | 'table';

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

export default function AuditPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Expanded state for events
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Selected event for View Details modal
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [currentHeightLoading, setCurrentHeightLoading] = useState(false);
  const [currentHeightLastFetch, setCurrentHeightLastFetch] = useState<number>(0);
  const currentHeightRetryCount = React.useRef(0);
  const [blockHeights, setBlockHeights] = useState<Map<string, number>>(new Map());

  // Track which txids are currently being fetched to prevent duplicate requests
  const fetchingRef = React.useRef<Set<string>>(new Set());

  // Queue for coordinating blockchain status fetches
  const fetchQueueRef = React.useRef<string[]>([]);
  const processingQueueRef = React.useRef(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Audit', href: '/audit' },
  ];

  // Process the fetch queue sequentially with rate limiting
  async function processTransactionQueue() {
    if (processingQueueRef.current || fetchQueueRef.current.length === 0) {
      return;
    }

    processingQueueRef.current = true;
    console.log(`[AuditPage] Starting queue processing. Queue length: ${fetchQueueRef.current.length}`);

    while (fetchQueueRef.current.length > 0) {
      // Take next batch of 2 transactions (conservative rate limit: 2 req/sec)
      const batch = fetchQueueRef.current.splice(0, 2);
      console.log(`[AuditPage] Processing batch of ${batch.length} transactions:`, batch.map(tx => tx.slice(0, 8)));

      // Process batch in parallel
      const fetchPromises = batch.map(async (txid) => {
        // Skip if already fetched or currently fetching
        if (blockHeights.has(txid) || fetchingRef.current.has(txid)) {
          console.log(`[AuditPage] Skipping ${txid.slice(0, 8)} - already processed`);
          return;
        }

        fetchingRef.current.add(txid);
        console.log(`[AuditPage] Fetching status for ${txid.slice(0, 8)}`);

        try {
          const response = await fetch('/api/transaction-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txid })
          });
          const data = await response.json();
          const height = data.blockHeight || 0;
          console.log(`[AuditPage] Received height ${height} for ${txid.slice(0, 8)}`);

          // Update block heights map
          setBlockHeights(prev => {
            const currentHeight = prev.get(txid);

            // Never decrease block height
            if (currentHeight && currentHeight > height && height > 0) {
              console.warn(
                `[AuditPage] Ignoring stale height ${height} (current: ${currentHeight}) for ${txid.slice(0, 8)}`
              );
              return prev;
            }

            const newMap = new Map(prev);
            newMap.set(txid, height);
            return newMap;
          });
        } catch (err) {
          console.error(`[AuditPage] Failed to fetch block height for ${txid.slice(0, 8)}:`, err);
        } finally {
          fetchingRef.current.delete(txid);
        }
      });

      await Promise.all(fetchPromises);

      // Wait 1 second between batches to respect rate limits (2 req/sec = 500ms per request)
      if (fetchQueueRef.current.length > 0) {
        console.log(`[AuditPage] Waiting 1s before next batch. Remaining: ${fetchQueueRef.current.length}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('[AuditPage] Queue processing complete');
    processingQueueRef.current = false;
  }

  // Add transaction to queue and start processing
  function queueTransactionFetch(txid: string) {
    // Skip if already in queue, already fetched, or currently fetching
    if (fetchQueueRef.current.includes(txid) || blockHeights.has(txid) || fetchingRef.current.has(txid)) {
      return;
    }

    console.log(`[AuditPage] Adding ${txid.slice(0, 8)} to fetch queue`);
    fetchQueueRef.current.push(txid);

    // Start processing if not already running
    if (!processingQueueRef.current) {
      processTransactionQueue();
    }
  }

  // Fetch current blockchain height with retry logic
  async function fetchCurrentHeightWithRetry(attempt = 0) {
    if (currentHeightLoading) return; // Prevent concurrent fetches

    setCurrentHeightLoading(true);

    try {
      const response = await fetch('/api/blockchain/current-height');
      const data = await response.json();

      if (response.ok && data.height && data.height > 0) {
        setCurrentHeight(data.height);
        setCurrentHeightLastFetch(Date.now());
        currentHeightRetryCount.current = 0;
        console.log(`[AuditPage] Current blockchain height: ${data.height}`);
      } else {
        throw new Error(`Invalid response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.warn(`[AuditPage] Failed to fetch current height (attempt ${attempt + 1}):`, error);

      // Retry with exponential backoff (max 3 attempts)
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
        console.log(`[AuditPage] Retrying in ${delay}ms...`);
        setTimeout(() => fetchCurrentHeightWithRetry(attempt + 1), delay);
      } else {
        console.error('[AuditPage] Failed to fetch current height after 3 attempts. Using cached value or showing partial status.');
      }
    } finally {
      setCurrentHeightLoading(false);
    }
  }

  // Load events and current height on mount
  useEffect(() => {
    loadEvents();
    fetchCurrentHeightWithRetry();
  }, []);

  // Auto-refresh current height every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if last fetch was > 30 seconds ago
      if (Date.now() - currentHeightLastFetch > 30000) {
        fetchCurrentHeightWithRetry();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentHeightLastFetch]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [events, eventTypeFilter, searchQuery, dateStart, dateEnd]);

  // Queue transaction fetches when filtered events change
  useEffect(() => {
    console.log(`[AuditPage] Queueing transaction fetches for ${filteredEvents.length} events`);

    filteredEvents.forEach(event => {
      if (event.details.txid) {
        queueTransactionFetch(event.details.txid);
      }
    });
  }, [filteredEvents]);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await getAuditEventsAction({
        eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
        dateStart,
        dateEnd,
        search: searchQuery,
      });
      setEvents(result);
    } catch (error) {
      console.error('Failed to load audit events:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...events];

    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter((event) => event.type === eventTypeFilter);
    }

    // Filter by search query (LEI, description, jurisdiction, person name, role, entity name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.details.lei?.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.details.jurisdiction?.toLowerCase().includes(query) ||
          event.details.verification?.credential?.personLegalName?.toLowerCase().includes(query) ||
          event.details.verification?.credential?.engagementContextRole?.toLowerCase().includes(query) ||
          event.details.verification?.credential?.legalName?.toLowerCase().includes(query)
      );
    }

    // Filter by date range
    if (dateStart) {
      const startDate = new Date(dateStart);
      filtered = filtered.filter((event) => new Date(event.timestamp) >= startDate);
    }
    if (dateEnd) {
      const endDate = new Date(dateEnd);
      filtered = filtered.filter((event) => new Date(event.timestamp) <= endDate);
    }

    setFilteredEvents(filtered);
  }

  function handleResetFilters() {
    setEventTypeFilter('all');
    setSearchQuery('');
    setDateStart('');
    setDateEnd('');
  }

  function toggleEventExpanded(eventId: string) {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  }


  // Get entity name from verification data
  function getEntityName(event: AuditEvent): string {
    // Try to get legal name from verification data (fetched from GLEIF during verification)
    const legalName = event.details.verification?.credential?.legalName;
    if (legalName && legalName !== 'Unknown Entity') {
      return legalName;
    }

    // Fall back to LEI if no legal name available
    const lei = event.details.lei;
    if (lei) {
      return lei;
    }

    return 'Unknown Entity';
  }

  // Get Basel CCR category from classification data
  function getBaselCategory(event: AuditEvent): string | null {
    return event.details.classification || event.details.classificationData?.category || null;
  }

  // Get jurisdiction from event details
  function getJurisdiction(event: AuditEvent): string | null {
    return event.details.jurisdiction || event.details.verification?.jurisdiction || null;
  }

  // Get confirmations from blockchain status
  function getConfirmations(event: AuditEvent): number {
    if (!event.details.txid) return 0;

    const blockHeight = blockHeights.get(event.details.txid);
    if (!blockHeight || blockHeight === 0 || currentHeight === 0) {
      return 0;
    }

    return Math.max(0, currentHeight - blockHeight + 1);
  }

  // Helper function for table view icons
  function getEventIcon(type: string) {
    switch (type) {
      case 'verification':
        return CheckCircle2;
      case 'classification':
        return FileText;
      case 'anchoring':
        return Anchor;
      default:
        return AlertTriangle;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8 fade-in">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-responsive-xl font-bold text-foreground mt-4">
            Audit Timeline
          </h1>
          <p className="text-responsive-sm text-muted-foreground mt-2">
            View all verification, classification, and anchoring events
          </p>
        </div>

        {/* Filters Bar */}
        <Card className="mb-6 fade-in">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Event Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="event-type-filter" className="text-xs">
                  Event Type
                </Label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger id="event-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="anchoring">Anchoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Start */}
              <div className="space-y-2">
                <Label htmlFor="date-start" className="text-xs">
                  Start Date
                </Label>
                <Input
                  id="date-start"
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </div>

              {/* Date End */}
              <div className="space-y-2">
                <Label htmlFor="date-end" className="text-xs">
                  End Date
                </Label>
                <Input
                  id="date-end"
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                />
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-xs">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by LEI, name, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label className="text-xs opacity-0">Actions</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant={viewMode === 'timeline' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('timeline')}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        )}

        {/* Timeline View */}
        {!loading && viewMode === 'timeline' && (
          <div className="fade-in">
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No events found matching your filters.</p>
                  <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredEvents.map((event) => {
                  const entityName = getEntityName(event);
                  const baselCategory = getBaselCategory(event);
                  const jurisdiction = getJurisdiction(event);
                  const confirmations = getConfirmations(event);
                  const explorerUrl = event.details.txid
                    ? `https://whatsonchain.com/tx/${event.details.txid}`
                    : null;

                  return (
                    <Card key={event.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        {/* Entity Header */}
                        <div className="mb-4">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            🏢 {entityName}
                          </h3>
                          <div className="mt-1 space-y-1">
                            {event.details.lei && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">LEI:</span> {event.details.lei}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                              {baselCategory && (
                                <span>
                                  <span className="font-semibold">Basel CCR:</span> {baselCategory}
                                </span>
                              )}
                              {jurisdiction && (
                                <span>
                                  <span className="font-semibold">Jurisdiction:</span> {jurisdiction}
                                </span>
                              )}
                              <span>
                                {new Date(event.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}{' '}
                                at{' '}
                                {new Date(event.timestamp).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Separator className="mb-4" />

                        {/* Audit Trail Status Bar */}
                        <div className="mb-4">
                          <AuditTrailStatusBar
                            hasVerification={!!event.details.verification}
                            hasClassification={!!event.details.classificationData || !!event.details.classification}
                            hasAnchoring={!!event.details.txid}
                            confirmations={confirmations}
                            onStepClick={(_step) => {
                              setSelectedEventId(event.id);
                            }}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {explorerUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(explorerUrl, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Explorer
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === 'table' && (
          <Card className="fade-in">
            <CardContent className="p-0">
              {filteredEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No events found matching your filters.</p>
                  <Button variant="outline" onClick={handleResetFilters} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <TableRow key={event.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm capitalize">{event.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {event.referenceId}
                          </TableCell>
                          <TableCell className="text-sm">{event.description}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleEventExpanded(event.id)}
                            >
                              {expandedEvents.has(event.id) ? 'Hide' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Event Details Modal */}
        {selectedEventId && (
          <EventDetailsModal
            eventId={selectedEventId}
            events={filteredEvents}
            onClose={() => setSelectedEventId(null)}
            getEntityName={getEntityName}
          />
        )}
      </div>
    </div>
  );
}
