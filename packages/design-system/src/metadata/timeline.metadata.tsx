"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { Timeline, TimelineEvent } from '../components/timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/card';
import { CheckCircle, FileText, Link as LinkIcon, AlertTriangle } from 'lucide-react';

// Preview wrapper components with state
function MainPreview() {
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'Verification',
      title: 'vLEI Credential Verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      description: 'Credential for ABC Corporation verified successfully',
      status: 'success',
      metadata: {
        LEI: '529900T8BM49AURSDO55',
        legal_name: 'ABC Corporation',
        jurisdiction: 'US-DE',
      },
    },
    {
      id: '2',
      type: 'Classification',
      title: 'Basel CCR Classification Complete',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      description: 'Counterparty classified under KY_INS_ALL layout',
      status: 'success',
      metadata: {
        layout: 'KY_INS_ALL',
        category: 'Insurance Company',
        risk_weight: '20%',
      },
    },
    {
      id: '3',
      type: 'Anchoring',
      title: 'Blockchain Transaction Anchored',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      description: 'Audit trail successfully anchored to BSV blockchain',
      status: 'success',
      metadata: {
        txid: '1a2b3c4d5e6f7g8h9i0j',
        basket: 'leicca-vlei-audit',
        confirmations: 6,
      },
    },
    {
      id: '4',
      type: 'Error',
      title: 'Verification Failed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      description: 'Credential signature verification failed',
      status: 'error',
      details: 'Invalid signature. The credential may have been tampered with or is using an untrusted issuer.',
    },
  ];

  return (
    <div className="max-w-3xl">
      <Timeline events={events} />
    </div>
  );
}

function AuditPagePreview() {
  const auditEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'Verification',
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'Credential Verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: 'LEI 529900T8BM49AURSDO55 verified',
      status: 'success',
      details: (
        <div className="space-y-2">
          <p><strong>Legal Name:</strong> ABC Corporation</p>
          <p><strong>Jurisdiction:</strong> US-DE</p>
          <p><strong>Issuer:</strong> GLEIF QVI</p>
        </div>
      ),
    },
    {
      id: '2',
      type: 'Classification',
      icon: <FileText className="h-4 w-4" />,
      title: 'Counterparty Classified',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      description: 'Basel CCR classification completed',
      status: 'success',
      metadata: {
        layout: 'KY_INS_ALL',
        outcome: 'Insurance Company - General',
        confidence: '98%',
      },
    },
    {
      id: '3',
      type: 'Anchoring',
      icon: <LinkIcon className="h-4 w-4" />,
      title: 'Audit Trail Anchored',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      description: 'Evidence files anchored to blockchain',
      status: 'success',
      metadata: {
        txid: 'a1b2c3d4e5f6g7h8i9j0',
        files: 3,
        basket: 'leicca-vlei-audit',
      },
    },
    {
      id: '4',
      type: 'Warning',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Classification Confidence Low',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      description: 'Manual review recommended',
      status: 'warning',
      details: 'Classification completed but confidence is below 80%. Please review the decision tree path.',
    },
  ];

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Audit Timeline</CardTitle>
        <CardDescription>
          Complete history of verification, classification, and anchoring events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline events={auditEvents} />
      </CardContent>
    </Card>
  );
}

function CompactTimelinePreview() {
  const compactEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'Update',
      title: 'Profile updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      description: 'User profile information changed',
      status: 'success',
    },
    {
      id: '2',
      type: 'Login',
      title: 'User logged in',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      description: 'From IP: 192.168.1.1',
      status: 'info',
    },
    {
      id: '3',
      type: 'Action',
      title: 'Document uploaded',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      description: 'contract_2024.pdf',
      status: 'success',
    },
    {
      id: '4',
      type: 'Error',
      title: 'Failed login attempt',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      description: 'Invalid credentials',
      status: 'error',
    },
    {
      id: '5',
      type: 'Action',
      title: 'Account created',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      description: 'Welcome to the platform!',
      status: 'success',
    },
  ];

  return (
    <div className="max-w-2xl">
      <Timeline events={compactEvents} variant="compact" />
    </div>
  );
}

function StatusTimelinePreview() {
  const statusEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'Process',
      title: 'Deployment Successful',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      description: 'Application deployed to production',
      status: 'success',
    },
    {
      id: '2',
      type: 'Process',
      title: 'Build in Progress',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: 'Building application bundle...',
      status: 'pending',
    },
    {
      id: '3',
      type: 'Process',
      title: 'Tests Passed',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      description: '127 tests passed successfully',
      status: 'success',
    },
    {
      id: '4',
      type: 'Process',
      title: 'Linting Warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      description: '3 warnings found in code',
      status: 'warning',
    },
    {
      id: '5',
      type: 'Process',
      title: 'Build Failed',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      description: 'TypeScript compilation error',
      status: 'error',
      details: 'Error: Type "string" is not assignable to type "number" in file app.tsx:42',
    },
  ];

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Deployment Pipeline</CardTitle>
        <CardDescription>
          Status of build, test, and deployment stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline events={statusEvents} />
      </CardContent>
    </Card>
  );
}

function InteractiveTimelinePreview() {
  const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);

  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'Transaction',
      title: 'Payment Received',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: '$1,234.56 from John Doe',
      status: 'success',
      metadata: {
        amount: '$1,234.56',
        from: 'John Doe',
        method: 'Credit Card',
      },
    },
    {
      id: '2',
      type: 'Transaction',
      title: 'Invoice Sent',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      description: 'Invoice #INV-2024-001 sent to client',
      status: 'info',
      metadata: {
        invoice_number: 'INV-2024-001',
        client: 'ABC Corp',
        amount: '$1,234.56',
      },
    },
    {
      id: '3',
      type: 'Transaction',
      title: 'Subscription Renewed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      description: 'Pro plan subscription renewed',
      status: 'success',
      metadata: {
        plan: 'Pro',
        billing_cycle: 'Monthly',
        next_billing: '2024-02-01',
      },
    },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Timeline
        events={events}
        onEventClick={(event) => setSelectedEvent(event)}
      />
      {selectedEvent && (
        <Card className="bg-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Selected Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>ID:</strong> {selectedEvent.id}
            </p>
            <p className="text-sm">
              <strong>Type:</strong> {selectedEvent.type}
            </p>
            <p className="text-sm">
              <strong>Title:</strong> {selectedEvent.title}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const timelineMetadata: ComponentMetadata = {
  id: 'timeline',
  name: 'Timeline',
  description: 'Vertical timeline component for displaying chronological events with expandable details',
  category: 'display',
  variants: ['default', 'compact'],
  preview: <MainPreview />,
  props: [
    {
      name: 'events',
      type: 'TimelineEvent[]',
      description: 'Array of timeline events to display',
      required: true,
    },
    {
      name: 'onEventClick',
      type: '(event: TimelineEvent) => void',
      description: 'Callback when an event is clicked',
      required: false,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'variant',
      type: '"default" | "compact"',
      description: 'Timeline display variant',
      required: false,
      defaultValue: '"default"',
    },
    {
      name: 'showConnector',
      type: 'boolean',
      description: 'Show connecting line between events',
      required: false,
      defaultValue: 'true',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessibility label',
      required: false,
      defaultValue: '"Timeline"',
    },
  ],
  examples: [
    {
      title: 'VLEI Audit Timeline',
      description: 'Display verification, classification, and anchoring events',
      code: `'use client'

import { Timeline, TimelineEvent } from '@/components/timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { CheckCircle, FileText, Link as LinkIcon } from 'lucide-react';

export function AuditTimeline() {
  const auditEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'Verification',
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'Credential Verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: 'LEI 529900T8BM49AURSDO55 verified',
      status: 'success',
      details: (
        <div className="space-y-2">
          <p><strong>Legal Name:</strong> ABC Corporation</p>
          <p><strong>Jurisdiction:</strong> US-DE</p>
        </div>
      ),
    },
    {
      id: '2',
      type: 'Classification',
      icon: <FileText className="h-4 w-4" />,
      title: 'Counterparty Classified',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      description: 'Basel CCR classification completed',
      status: 'success',
      metadata: {
        layout: 'KY_INS_ALL',
        outcome: 'Insurance Company - General',
      },
    },
    {
      id: '3',
      type: 'Anchoring',
      icon: <LinkIcon className="h-4 w-4" />,
      title: 'Audit Trail Anchored',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      description: 'Evidence files anchored to blockchain',
      status: 'success',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Timeline</CardTitle>
        <CardDescription>
          Complete history of events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline events={auditEvents} />
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <AuditPagePreview />,
    },
    {
      title: 'Compact Activity Log',
      description: 'Compact timeline variant for activity feeds',
      code: `'use client'

import { Timeline, TimelineEvent } from '@/components/timeline';

export function ActivityLog() {
  const activities: TimelineEvent[] = [
    {
      id: '1',
      type: 'Update',
      title: 'Profile updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      description: 'User profile information changed',
      status: 'success',
    },
    {
      id: '2',
      type: 'Login',
      title: 'User logged in',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      description: 'From IP: 192.168.1.1',
      status: 'info',
    },
    {
      id: '3',
      type: 'Action',
      title: 'Document uploaded',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      description: 'contract_2024.pdf',
      status: 'success',
    },
  ];

  return <Timeline events={activities} variant="compact" />;
}`,
      language: 'tsx',
      preview: <CompactTimelinePreview />,
    },
    {
      title: 'Deployment Pipeline Status',
      description: 'Timeline with different status indicators',
      code: `'use client'

import { Timeline, TimelineEvent } from '@/components/timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function DeploymentPipeline() {
  const stages: TimelineEvent[] = [
    {
      id: '1',
      type: 'Process',
      title: 'Deployment Successful',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      description: 'Application deployed to production',
      status: 'success',
    },
    {
      id: '2',
      type: 'Process',
      title: 'Build in Progress',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: 'Building application bundle...',
      status: 'pending',
    },
    {
      id: '3',
      type: 'Process',
      title: 'Tests Passed',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      description: '127 tests passed successfully',
      status: 'success',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Pipeline</CardTitle>
        <CardDescription>
          Status of build, test, and deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline events={stages} />
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <StatusTimelinePreview />,
    },
    {
      title: 'Interactive Timeline with Click Handler',
      description: 'Timeline with event click handling',
      code: `'use client'

import { useState } from 'react';
import { Timeline, TimelineEvent } from '@/components/timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';

export function InteractiveTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'Transaction',
      title: 'Payment Received',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      description: '$1,234.56 from John Doe',
      status: 'success',
      metadata: {
        amount: '$1,234.56',
        from: 'John Doe',
      },
    },
    // ... more events
  ];

  return (
    <div className="space-y-4">
      <Timeline
        events={events}
        onEventClick={(event) => setSelectedEvent(event)}
      />
      {selectedEvent && (
        <Card className="bg-accent/5">
          <CardHeader>
            <CardTitle>Selected: {selectedEvent.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Type: {selectedEvent.type}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}`,
      language: 'tsx',
      preview: <InteractiveTimelinePreview />,
    },
  ],
  dependencies: ['react', 'lucide-react', '@radix-ui/react-collapsible'],
  tags: ['timeline', 'events', 'history', 'audit', 'log', 'activity', 'chronological', 'vlei', 'blockchain'],
};
