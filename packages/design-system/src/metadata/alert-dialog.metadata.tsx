import type { ComponentMetadata } from '../types/component.types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/alert-dialog';
import { Button } from '../components/button';

export const alertDialogMetadata: ComponentMetadata = {
  id: 'alert-dialog',
  name: 'AlertDialog',
  description: 'Accessible alert dialog for critical user confirmations and destructive actions',
  category: 'overlay',
  variants: [],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">AlertDialog Example</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete Account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  ),
  props: [
    {
      name: 'open',
      type: 'boolean',
      description: 'Controlled open state',
      required: false,
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: 'Open state change handler',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'AlertDialog content (trigger and content)',
      required: true,
    },
  ],
  examples: [
    {
      title: 'Delete Confirmation',
      description: 'Destructive action confirmation for permanent data deletion',
      code: `import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

export function DeleteConfirmation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Transaction</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove transaction #12345 from the blockchain.
            This action cannot be undone and may affect your wallet balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete Transaction</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
      language: 'tsx',
      preview: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Transaction</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove transaction #12345 from the blockchain.
                This action cannot be undone and may affect your wallet balance.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete Transaction</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: 'Logout Confirmation',
      description: 'Session termination warning with data loss prevention',
      code: `import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

export function LogoutConfirmation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Logout</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End Session?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes in your wallet configuration. Logging out now
            will discard these changes. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay Logged In</AlertDialogCancel>
          <AlertDialogAction>Logout Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
      language: 'tsx',
      preview: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Logout</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Session?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes in your wallet configuration. Logging out now
                will discard these changes. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Stay Logged In</AlertDialogCancel>
              <AlertDialogAction>Logout Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: 'Unsaved Changes Warning',
      description: 'Prevent data loss when navigating away from form',
      code: `import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

export function UnsavedChangesWarning() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Close Form</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have made changes to the wallet configuration that haven't been saved.
            These changes will be lost if you continue without saving.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Editing</AlertDialogCancel>
          <AlertDialogAction>Discard Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
      language: 'tsx',
      preview: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">Close Form</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have made changes to the wallet configuration that haven't been saved.
                These changes will be lost if you continue without saving.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction>Discard Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: 'Subscription Cancellation',
      description: 'Subscription cancellation with consequences explained',
      code: `import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

export function SubscriptionCancellation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Cancel Subscription</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Premium Subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Canceling your subscription will:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Revoke access to premium API endpoints</li>
              <li>Disable advanced blockchain analytics</li>
              <li>Remove priority transaction processing</li>
            </ul>
            <p className="mt-2">Your subscription will remain active until the end of the billing period.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction>Cancel Subscription</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
      language: 'tsx',
      preview: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Cancel Subscription</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Premium Subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                Canceling your subscription will:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Revoke access to premium API endpoints</li>
                  <li>Disable advanced blockchain analytics</li>
                  <li>Remove priority transaction processing</li>
                </ul>
                <p className="mt-2">Your subscription will remain active until the end of the billing period.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction>Cancel Subscription</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
    {
      title: 'Custom Content with Details',
      description: 'Complex confirmation with detailed information and custom styling',
      code: `import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/alert-dialog';
import { Button } from '@/components/button';

export function WalletReset() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Reset Wallet</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Wallet to Factory Settings?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently reset your wallet configuration and remove all custom settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-3">
          <div className="rounded-md bg-muted p-3">
            <h4 className="text-sm font-semibold mb-2">What will be reset:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>All custom transaction templates</li>
              <li>Saved blockchain endpoints</li>
              <li>UI preferences and theme settings</li>
              <li>API key configurations</li>
            </ul>
          </div>
          <div className="rounded-md bg-yellow-500/10 p-3 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              <strong>Warning:</strong> Your private keys and wallet balance will NOT be affected.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Reset Wallet</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}`,
      language: 'tsx',
      preview: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Reset Wallet</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Wallet to Factory Settings?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently reset your wallet configuration and remove all custom settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-3">
              <div className="rounded-md bg-muted p-3">
                <h4 className="text-sm font-semibold mb-2">What will be reset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>All custom transaction templates</li>
                  <li>Saved blockchain endpoints</li>
                  <li>UI preferences and theme settings</li>
                  <li>API key configurations</li>
                </ul>
              </div>
              <div className="rounded-md bg-yellow-500/10 p-3 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  <strong>Warning:</strong> Your private keys and wallet balance will NOT be affected.
                </p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Reset Wallet</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-alert-dialog'],
  tags: ['alert', 'dialog', 'modal', 'confirmation', 'destructive', 'warning', 'overlay'],
};
