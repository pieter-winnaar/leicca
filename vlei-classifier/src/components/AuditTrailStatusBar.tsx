/**
 * AuditTrailStatusBar Component
 *
 * Displays a visual workflow indicator showing the audit trail steps:
 * Verification → Classification → Anchoring → Blockchain Confirmation
 *
 * Each step shows its current state (complete, pending, in progress, failed)
 * and the blockchain confirmation status shows progress (0-6 confirmations).
 */

'use client';

import React from 'react';
import { CheckCircle2, Circle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@design-system-demo/design-system';

export interface AuditTrailStatusBarProps {
  hasVerification: boolean;
  hasClassification: boolean;
  hasAnchoring: boolean;
  confirmations: number; // 0-6
  onStepClick?: (step: 'verification' | 'classification' | 'anchoring' | 'blockchain') => void;
}

interface Step {
  id: 'verification' | 'classification' | 'anchoring';
  label: string;
  isComplete: boolean;
  isPending: boolean;
  isFailed: boolean;
}

/**
 * Displays the audit trail workflow with step-by-step status
 * Shows: Verification → Classification → Anchoring → Blockchain Confirmation
 */
export function AuditTrailStatusBar({
  hasVerification,
  hasClassification,
  hasAnchoring,
  confirmations,
  onStepClick,
}: AuditTrailStatusBarProps) {
  const steps: Step[] = [
    {
      id: 'verification',
      label: 'Verified',
      isComplete: hasVerification,
      isPending: !hasVerification,
      isFailed: false,
    },
    {
      id: 'classification',
      label: 'Classified',
      isComplete: hasClassification,
      isPending: !hasClassification,
      isFailed: false,
    },
    {
      id: 'anchoring',
      label: 'Anchored',
      isComplete: hasAnchoring,
      isPending: !hasAnchoring,
      isFailed: false,
    },
  ];

  // Determine blockchain confirmation status
  let blockchainLabel = 'Pending';
  let blockchainVariant: 'default' | 'secondary' | 'outline' = 'outline';
  let blockchainIcon = null;

  if (hasAnchoring) {
    if (confirmations === 0) {
      blockchainLabel = 'Pending';
      blockchainVariant = 'outline';
      blockchainIcon = <Loader2 className="w-3 h-3 mr-1 animate-spin" />;
    } else if (confirmations < 6) {
      blockchainLabel = `Confirming (${confirmations}/6)`;
      blockchainVariant = 'secondary';
      blockchainIcon = <Loader2 className="w-3 h-3 mr-1 animate-spin" />;
    } else {
      blockchainLabel = 'Confirmed';
      blockchainVariant = 'default';
      blockchainIcon = <CheckCircle2 className="w-3 h-3 mr-1" />;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step badge */}
          <Badge
            variant={step.isComplete ? 'default' : 'outline'}
            className={onStepClick ? 'cursor-pointer hover:opacity-80' : ''}
            onClick={() => onStepClick?.(step.id)}
          >
            {step.isComplete && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {step.isPending && !step.isFailed && <Circle className="w-3 h-3 mr-1" />}
            {step.isFailed && <XCircle className="w-3 h-3 mr-1" />}
            {step.label}
          </Badge>

          {/* Arrow between steps */}
          {index < steps.length - 1 && (
            <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          )}
        </React.Fragment>
      ))}

      {/* Blockchain confirmation status */}
      {hasAnchoring && (
        <>
          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <Badge
            variant={blockchainVariant}
            className={onStepClick ? 'cursor-pointer hover:opacity-80' : ''}
            onClick={() => onStepClick?.('blockchain')}
          >
            {blockchainIcon}
            {blockchainLabel}
          </Badge>
        </>
      )}
    </div>
  );
}
