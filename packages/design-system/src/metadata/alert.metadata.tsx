
import type { ComponentMetadata } from '../types/component.types';
import { Alert, AlertTitle, AlertDescription } from '../components/alert';
import { AlertCircle, Info } from 'lucide-react';

export const alertMetadata: ComponentMetadata = {
  id: 'alert',
  name: 'Alert',
  description: 'Feedback component for informational messages and error states',
  category: 'feedback',
  variants: ['default', 'destructive'],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Alert Variants</h3>
        <div className="space-y-4 max-w-2xl">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This is an error alert message.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  ),
  props: [
    {
      name: 'variant',
      type: '"default" | "destructive"',
      description: 'Alert style variant',
      required: false,
      defaultValue: '"default"'
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Alert content (typically AlertTitle and AlertDescription)',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Default Alert',
      description: 'Informational alert message',
      code: `<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational alert message.
  </AlertDescription>
</Alert>`,
      language: 'tsx',
      preview: (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational alert message.
          </AlertDescription>
        </Alert>
      )
    },
    {
      title: 'Destructive Alert',
      description: 'Error or warning alert message',
      code: `<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    An error occurred. Please try again.
  </AlertDescription>
</Alert>`,
      language: 'tsx',
      preview: (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            An error occurred. Please try again.
          </AlertDescription>
        </Alert>
      )
    }
  ],
  dependencies: ['react'],
  tags: ['alert', 'notification', 'message', 'feedback', 'banner']
};
