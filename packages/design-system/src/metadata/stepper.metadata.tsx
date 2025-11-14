"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { Stepper, Step } from '../components/stepper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';

// Preview wrapper components with state
function MainPreview() {
  const [currentStep, setCurrentStep] = React.useState(1);

  const steps: Step[] = [
    { id: '1', label: 'Account', description: 'Create your account' },
    { id: '2', label: 'Profile', description: 'Complete your profile' },
    { id: '3', label: 'Preferences', description: 'Set preferences' },
    { id: '4', label: 'Review', description: 'Review and confirm' },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Stepper steps={steps} currentStep={currentStep} />
      <div className="flex gap-2">
        <Button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function ClassificationQuestionnairePreview() {
  const [currentStep, setCurrentStep] = React.useState(2);

  const questionSteps: Step[] = [
    { id: '1', label: 'Question 1', description: 'Entity type' },
    { id: '2', label: 'Question 2', description: 'Jurisdiction' },
    { id: '3', label: 'Question 3', description: 'Business activity' },
    { id: '4', label: 'Question 4', description: 'Regulatory status' },
    { id: '5', label: 'Question 5', description: 'Capital adequacy' },
    { id: '6', label: 'Question 6', description: 'Risk profile' },
    { id: '7', label: 'Question 7', description: 'Counterparty type' },
    { id: '8', label: 'Question 8', description: 'Final classification' },
  ];

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Basel CCR Classification</CardTitle>
        <CardDescription>
          Answer the following questions to classify the counterparty
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper
          steps={questionSteps}
          currentStep={currentStep}
          showProgress={true}
        />
        <div className="mt-6 p-4 bg-accent/5 rounded-lg">
          <p className="text-sm font-medium mb-2">
            Question {currentStep + 1}: {questionSteps[currentStep]?.description || ''}
          </p>
          <p className="text-sm text-muted-foreground">
            [Question content would appear here]
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(questionSteps.length - 1, currentStep + 1))}
          disabled={currentStep === questionSteps.length - 1}
        >
          {currentStep === questionSteps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function AnchoringProgressPreview() {
  const [currentStep, setCurrentStep] = React.useState(1);

  const anchoringSteps: Step[] = [
    { id: '1', label: 'Upload', description: 'Upload evidence files' },
    { id: '2', label: 'Verify', description: 'Verify file hashes' },
    { id: '3', label: 'Create', description: 'Create audit capsule' },
    { id: '4', label: 'Broadcast', description: 'Broadcast transaction' },
    { id: '5', label: 'Confirm', description: 'Wait for confirmation' },
  ];

  React.useEffect(() => {
    if (currentStep < anchoringSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Blockchain Anchoring</CardTitle>
        <CardDescription>
          Anchoring your audit trail to the BSV blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper
          steps={anchoringSteps}
          currentStep={currentStep}
          showProgress={true}
        />
        <div className="mt-6 text-center">
          {currentStep < anchoringSteps.length - 1 ? (
            <p className="text-sm text-muted-foreground">
              Processing... {anchoringSteps[currentStep]?.description || ''}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">
                Anchoring Complete!
              </p>
              <p className="text-xs text-muted-foreground">
                Transaction ID: a1b2c3d4e5f6g7h8i9j0
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CompactStepperPreview() {
  const [currentStep, setCurrentStep] = React.useState(1);

  const steps: Step[] = [
    { id: '1', label: 'Start' },
    { id: '2', label: 'Process' },
    { id: '3', label: 'Complete' },
  ];

  return (
    <div className="max-w-md space-y-4">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        variant="compact"
        showProgress={false}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
          size="sm"
        >
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          size="sm"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

function VerticalStepperPreview() {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps: Step[] = [
    {
      id: '1',
      label: 'Personal Information',
      description: 'Provide your basic details',
    },
    {
      id: '2',
      label: 'Address',
      description: 'Enter your address information',
    },
    {
      id: '3',
      label: 'Payment',
      description: 'Set up payment method',
      optional: true,
    },
    {
      id: '4',
      label: 'Confirmation',
      description: 'Review and submit',
    },
  ];

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          orientation="vertical"
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ClickableStepperPreview() {
  const [currentStep, setCurrentStep] = React.useState(2);

  const steps: Step[] = [
    { id: '1', label: 'Basics', description: 'Basic information' },
    { id: '2', label: 'Details', description: 'Detailed information' },
    { id: '3', label: 'Review', description: 'Review your data' },
    { id: '4', label: 'Submit', description: 'Submit your form' },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
        allowClickableSteps={true}
      />
      <div className="p-4 bg-accent/5 rounded-lg">
        <p className="text-sm font-medium">
          Current: {steps[currentStep]?.label || ''}
        </p>
        <p className="text-xs text-muted-foreground">
          Click on completed steps to go back
        </p>
      </div>
    </div>
  );
}

export const stepperMetadata: ComponentMetadata = {
  id: 'stepper',
  name: 'Stepper',
  description: 'Multi-step progress indicator with navigation support and progress tracking',
  category: 'display',
  variants: ['default', 'compact'],
  preview: <MainPreview />,
  props: [
    {
      name: 'steps',
      type: 'Step[]',
      description: 'Array of step objects with id, label, description, status',
      required: true,
    },
    {
      name: 'currentStep',
      type: 'number',
      description: 'Index of the current active step',
      required: true,
    },
    {
      name: 'onStepClick',
      type: '(step: number) => void',
      description: 'Callback when a step is clicked (if allowClickableSteps is true)',
      required: false,
    },
    {
      name: 'variant',
      type: '"default" | "compact"',
      description: 'Visual variant of the stepper',
      required: false,
      defaultValue: '"default"',
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      description: 'Layout orientation',
      required: false,
      defaultValue: '"horizontal"',
    },
    {
      name: 'showProgress',
      type: 'boolean',
      description: 'Show progress bar and percentage',
      required: false,
      defaultValue: 'true',
    },
    {
      name: 'allowClickableSteps',
      type: 'boolean',
      description: 'Allow clicking on completed steps to navigate',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessibility label',
      required: false,
      defaultValue: '"Progress steps"',
    },
  ],
  examples: [
    {
      title: 'Classification Questionnaire',
      description: 'Multi-step questionnaire with progress tracking',
      code: `'use client'

import { useState } from 'react';
import { Stepper, Step } from '@/components/stepper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';

export function ClassificationQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(2);

  const steps: Step[] = [
    { id: '1', label: 'Question 1', description: 'Entity type' },
    { id: '2', label: 'Question 2', description: 'Jurisdiction' },
    { id: '3', label: 'Question 3', description: 'Business activity' },
    { id: '4', label: 'Question 4', description: 'Regulatory status' },
    { id: '5', label: 'Question 5', description: 'Capital adequacy' },
    { id: '6', label: 'Question 6', description: 'Risk profile' },
    { id: '7', label: 'Question 7', description: 'Counterparty type' },
    { id: '8', label: 'Question 8', description: 'Final classification' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basel CCR Classification</CardTitle>
        <CardDescription>
          Answer the following questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper steps={steps} currentStep={currentStep} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <ClassificationQuestionnairePreview />,
    },
    {
      title: 'Anchoring Progress Indicator',
      description: 'Loading states with automatic step progression',
      code: `'use client'

import { useState, useEffect } from 'react';
import { Stepper, Step } from '@/components/stepper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';

export function AnchoringProgress() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    { id: '1', label: 'Upload', description: 'Upload evidence files' },
    { id: '2', label: 'Verify', description: 'Verify file hashes' },
    { id: '3', label: 'Create', description: 'Create audit capsule' },
    { id: '4', label: 'Broadcast', description: 'Broadcast transaction' },
    { id: '5', label: 'Confirm', description: 'Wait for confirmation' },
  ];

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Anchoring</CardTitle>
        <CardDescription>
          Anchoring your audit trail
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper steps={steps} currentStep={currentStep} />
      </CardContent>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <AnchoringProgressPreview />,
    },
    {
      title: 'Compact Stepper',
      description: 'Minimal stepper for space-constrained layouts',
      code: `'use client'

import { useState } from 'react';
import { Stepper, Step } from '@/components/stepper';
import { Button } from '@/components/button';

export function CompactStepper() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps: Step[] = [
    { id: '1', label: 'Start' },
    { id: '2', label: 'Process' },
    { id: '3', label: 'Complete' },
  ];

  return (
    <div className="space-y-4">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        variant="compact"
        showProgress={false}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === 0}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}`,
      language: 'tsx',
      preview: <CompactStepperPreview />,
    },
    {
      title: 'Vertical Stepper',
      description: 'Vertical layout for sidebar or narrow containers',
      code: `'use client'

import { useState } from 'react';
import { Stepper, Step } from '@/components/stepper';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';

export function VerticalStepper() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      id: '1',
      label: 'Personal Information',
      description: 'Provide your basic details',
    },
    {
      id: '2',
      label: 'Address',
      description: 'Enter your address information',
    },
    {
      id: '3',
      label: 'Payment',
      description: 'Set up payment method',
      optional: true,
    },
    {
      id: '4',
      label: 'Confirmation',
      description: 'Review and submit',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          orientation="vertical"
        />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => setCurrentStep(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
}`,
      language: 'tsx',
      preview: <VerticalStepperPreview />,
    },
    {
      title: 'Clickable Stepper',
      description: 'Allow navigation by clicking on completed steps',
      code: `'use client'

import { useState } from 'react';
import { Stepper, Step } from '@/components/stepper';

export function ClickableStepper() {
  const [currentStep, setCurrentStep] = useState(2);

  const steps: Step[] = [
    { id: '1', label: 'Basics', description: 'Basic information' },
    { id: '2', label: 'Details', description: 'Detailed information' },
    { id: '3', label: 'Review', description: 'Review your data' },
    { id: '4', label: 'Submit', description: 'Submit your form' },
  ];

  return (
    <Stepper
      steps={steps}
      currentStep={currentStep}
      onStepClick={(step) => setCurrentStep(step)}
      allowClickableSteps={true}
    />
  );
}`,
      language: 'tsx',
      preview: <ClickableStepperPreview />,
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['stepper', 'steps', 'progress', 'wizard', 'multi-step', 'form', 'questionnaire', 'navigation'],
};
