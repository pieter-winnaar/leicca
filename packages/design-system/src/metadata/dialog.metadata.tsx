
import type { ComponentMetadata } from '../types/component.types';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/dialog';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Badge } from '../components/badge';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export const dialogMetadata: ComponentMetadata = {
  id: 'dialog',
  name: 'Dialog',
  description: 'Modal dialog window for focused user interactions and confirmations',
  category: 'overlay',
  variants: [],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Dialog Example</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description explaining what the dialog is for.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Dialog content goes here.
              </p>
            </div>
          </DialogContent>
        </Dialog>
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
      name: 'modal',
      type: 'boolean',
      description: 'Whether the dialog is modal',
      required: false,
      defaultValue: 'true'
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Dialog content (trigger and content)',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Basic Dialog',
      description: 'Simple dialog with trigger button',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a dialog description.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p className="text-popover-foreground">Dialog content goes here.</p>
    </div>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-popover-foreground">Dialog content goes here.</p>
            </div>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Edit Form Dialog',
      description: 'Dialog with a form for editing user profile information',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Edit Profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="John Doe" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue="john@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Input id="bio" defaultValue="Software developer" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Software developer" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Multi-Step Wizard',
      description: 'Dialog with multiple steps for onboarding flow',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Start Onboarding</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Welcome to Our Platform</DialogTitle>
      <DialogDescription>
        Step 1 of 3: Account Information
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 space-y-4">
      <div className="flex justify-center gap-2">
        <div className="h-2 w-16 rounded-full bg-primary" />
        <div className="h-2 w-16 rounded-full bg-muted" />
        <div className="h-2 w-16 rounded-full bg-muted" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" placeholder="Enter username" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Create password" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Back</Button>
      <Button>Next Step</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Start Onboarding</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome to Our Platform</DialogTitle>
              <DialogDescription>
                Step 1 of 3: Account Information
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex justify-center gap-2">
                <div className="h-2 w-16 rounded-full bg-primary" />
                <div className="h-2 w-16 rounded-full bg-muted" />
                <div className="h-2 w-16 rounded-full bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create password" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Back</Button>
              <Button>Next Step</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Image Viewer',
      description: 'Dialog for viewing full-screen images with navigation',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">View Gallery</Button>
  </DialogTrigger>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Image Gallery</DialogTitle>
      <DialogDescription>
        Photo 1 of 5
      </DialogDescription>
    </DialogHeader>
    <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground text-sm">Image Preview</div>
    </div>
    <DialogFooter className="justify-between">
      <Button variant="outline" size="icon">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Gallery</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Image Gallery</DialogTitle>
              <DialogDescription>
                Photo 1 of 5
              </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground text-sm">Image Preview</div>
            </div>
            <DialogFooter className="justify-between">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Confirmation Dialog',
      description: 'Dialog for confirming destructive actions',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        Delete Account
      </DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
        <p className="text-sm text-destructive font-medium">
          Are you absolutely sure?
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Type "DELETE" to confirm this action.
        </p>
        <Input className="mt-2" placeholder="Type DELETE here" />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete Account</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Type "DELETE" to confirm this action.
                </p>
                <Input className="mt-2" placeholder="Type DELETE here" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Delete Account</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Custom Footer Actions',
      description: 'Dialog with multiple action buttons in footer',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Review Changes</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Review Changes</DialogTitle>
      <DialogDescription>
        Review the changes before publishing your content.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 space-y-4">
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Title Updated</span>
          <Badge>Modified</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Content Edited</span>
          <Badge>Modified</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tags Added</span>
          <Badge variant="secondary">New</Badge>
        </div>
      </div>
    </div>
    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button variant="outline">Save Draft</Button>
      <Button variant="secondary">Schedule</Button>
      <Button>Publish Now</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Review Changes</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Changes</DialogTitle>
              <DialogDescription>
                Review the changes before publishing your content.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Title Updated</span>
                  <Badge>Modified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content Edited</span>
                  <Badge>Modified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tags Added</span>
                  <Badge variant="secondary">New</Badge>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button variant="secondary">Schedule</Button>
              <Button>Publish Now</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Scrollable Content',
      description: 'Dialog with long scrollable content',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">View Terms</Button>
  </DialogTrigger>
  <DialogContent className="max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>Terms of Service</DialogTitle>
      <DialogDescription>
        Please read our terms and conditions carefully.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 overflow-y-auto max-h-[50vh] space-y-4">
      <div>
        <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
        <p className="text-sm text-muted-foreground">
          By accessing and using this service, you accept and agree to be bound by the terms
          and provision of this agreement.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">2. Use License</h3>
        <p className="text-sm text-muted-foreground">
          Permission is granted to temporarily download one copy of the materials on our website
          for personal, non-commercial transitory viewing only.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">3. Disclaimer</h3>
        <p className="text-sm text-muted-foreground">
          The materials on our website are provided on an 'as is' basis. We make no warranties,
          expressed or implied, and hereby disclaim all other warranties.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">4. Limitations</h3>
        <p className="text-sm text-muted-foreground">
          In no event shall our company or its suppliers be liable for any damages arising
          out of the use or inability to use our services.
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline">Decline</Button>
      <Button>Accept Terms</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Terms</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>
                Please read our terms and conditions carefully.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 overflow-y-auto max-h-[50vh] space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm text-muted-foreground">
                  By accessing and using this service, you accept and agree to be bound by the terms
                  and provision of this agreement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Use License</h3>
                <p className="text-sm text-muted-foreground">
                  Permission is granted to temporarily download one copy of the materials on our website
                  for personal, non-commercial transitory viewing only.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Disclaimer</h3>
                <p className="text-sm text-muted-foreground">
                  The materials on our website are provided on an 'as is' basis. We make no warranties,
                  expressed or implied, and hereby disclaim all other warranties.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Limitations</h3>
                <p className="text-sm text-muted-foreground">
                  In no event shall our company or its suppliers be liable for any damages arising
                  out of the use or inability to use our services.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Decline</Button>
              <Button>Accept Terms</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    },
    {
      title: 'Nested Dialogs',
      description: 'Dialog that can trigger another dialog',
      code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Manage your account settings and preferences.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4 space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Account</h4>
        <p className="text-sm text-muted-foreground">
          Manage your account information and security settings.
        </p>
      </div>
      <div className="space-y-2">
        <h4 className="font-medium">Dangerous Zone</h4>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button variant="destructive">Confirm Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    <DialogFooter>
      <Button>Close Settings</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
      language: 'tsx',
      preview: (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your account settings and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Account</h4>
                <p className="text-sm text-muted-foreground">
                  Manage your account information and security settings.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Dangerous Zone</h4>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete your account?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Confirm Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <DialogFooter>
              <Button>Close Settings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }
  ],
  dependencies: ['react', '@radix-ui/react-dialog'],
  tags: ['dialog', 'modal', 'popup', 'overlay', 'confirmation']
};
