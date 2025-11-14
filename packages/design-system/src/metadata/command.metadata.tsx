'use client'

import type { ComponentMetadata } from '../types/component.types';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '../components/command';
import { Button } from '../components/button';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileText,
  Home,
  Inbox,
  Search,
} from 'lucide-react';
import { useState } from 'react';

export const commandMetadata: ComponentMetadata = {
  id: 'command',
  name: 'Command',
  description: 'Fast, composable, command palette for React',
  category: 'navigation',
  variants: ['default', 'dialog'],
  preview: (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The command menu content',
      required: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the command menu',
      required: false,
    },
    {
      name: 'shouldFilter',
      type: 'boolean',
      description: 'Enable/disable built-in filtering',
      required: false,
      defaultValue: 'true',
    },
  ],
  examples: [
    {
      title: 'Navigation Palette - Quick Page Navigation',
      description: 'Command dialog for quickly navigating between pages in your application',
      code: `'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/command';
import { Button } from '@/components/button';
import { Home, Inbox, Calendar, Search } from 'lucide-react';

export function NavigationPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Toggle with ⌘K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        <span>Search pages...</span>
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => router.push('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/inbox')}>
              <Inbox className="mr-2 h-4 w-4" />
              <span>Inbox</span>
            </CommandItem>
            <CommandItem onSelect={() => router.push('/calendar')}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}`,
      language: 'tsx',
      preview: (() => {
        const CommandDialogExample = () => {
          const [open, setOpen] = useState(false);
          return (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search pages...</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </Button>
              <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search pages..." />
                <CommandList>
                  <CommandEmpty>No pages found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    <CommandItem>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem>
                      <Inbox className="mr-2 h-4 w-4" />
                      <span>Inbox</span>
                    </CommandItem>
                    <CommandItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Calendar</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </>
          );
        };
        return <CommandDialogExample />;
      })(),
    },
    {
      title: 'Global Search - Search Across All Content',
      description: 'Command menu for searching across documents, users, and settings',
      code: `import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/command';
import { FileText, User } from 'lucide-react';

export function GlobalSearchMenu() {
  return (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="Search everything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Q4 Financial Report.pdf</span>
          </CommandItem>
          <CommandItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Marketing Strategy 2024.docx</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="People">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>John Smith</span>
            <CommandShortcut>Developer</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Sarah Johnson</span>
            <CommandShortcut>Designer</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}`,
      language: 'tsx',
      preview: (
        <Command className="rounded-lg border shadow-md max-w-md">
          <CommandInput placeholder="Search everything..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Documents">
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Q4 Financial Report.pdf</span>
              </CommandItem>
              <CommandItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Marketing Strategy 2024.docx</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="People">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>John Smith</span>
                <CommandShortcut>Developer</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Sarah Johnson</span>
                <CommandShortcut>Designer</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    },
    {
      title: 'Actions Menu - Keyboard-Driven Actions',
      description: 'Command menu for executing common actions with keyboard shortcuts',
      code: `import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/command';

export function ActionsMenu() {
  const handleNew = () => console.log('New file');
  const handleOpen = () => console.log('Open file');
  const handleSave = () => console.log('Save file');
  const handleCopy = () => console.log('Copy');
  const handlePaste = () => console.log('Paste');

  return (
    <Command className="rounded-lg border shadow-md max-w-md">
      <CommandInput placeholder="Type an action..." />
      <CommandList>
        <CommandEmpty>No actions found.</CommandEmpty>
        <CommandGroup heading="File Actions">
          <CommandItem onSelect={handleNew}>
            <span>New File</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={handleOpen}>
            <span>Open File</span>
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={handleSave}>
            <span>Save</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Edit Actions">
          <CommandItem onSelect={handleCopy}>
            <span>Copy</span>
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={handlePaste}>
            <span>Paste</span>
            <CommandShortcut>⌘V</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}`,
      language: 'tsx',
      preview: (
        <Command className="rounded-lg border shadow-md max-w-md">
          <CommandInput placeholder="Type an action..." />
          <CommandList>
            <CommandEmpty>No actions found.</CommandEmpty>
            <CommandGroup heading="File Actions">
              <CommandItem>
                <span>New File</span>
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Open File</span>
                <CommandShortcut>⌘O</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Save</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Edit Actions">
              <CommandItem>
                <span>Copy</span>
                <CommandShortcut>⌘C</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Paste</span>
                <CommandShortcut>⌘V</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    },
    {
      title: 'Quick Switcher - Switch Between Projects',
      description: 'Command menu for quickly switching between projects and workspaces',
      code: `'use client'

import { useState } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/command';
import { Button } from '@/components/button';

export function QuickSwitcher() {
  const [open, setOpen] = useState(false);

  const switchProject = (projectId: string) => {
    console.log('Switching to project:', projectId);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Switch Project
        <CommandShortcut>⌘J</CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Switch to project..." />
        <CommandList>
          <CommandEmpty>No projects found.</CommandEmpty>
          <CommandGroup heading="Recent Projects">
            <CommandItem onSelect={() => switchProject('web-app')}>
              <span>Web Application</span>
              <CommandShortcut>Active</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => switchProject('mobile-app')}>
              <span>Mobile App</span>
            </CommandItem>
            <CommandItem onSelect={() => switchProject('api-service')}>
              <span>API Service</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="All Projects">
            <CommandItem onSelect={() => switchProject('design-system')}>
              <span>Design System</span>
            </CommandItem>
            <CommandItem onSelect={() => switchProject('documentation')}>
              <span>Documentation Site</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}`,
      language: 'tsx',
      preview: (() => {
        const QuickSwitcherExample = () => {
          const [open, setOpen] = useState(false);
          return (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(true)}
              >
                Switch Project
                <CommandShortcut>⌘J</CommandShortcut>
              </Button>
              <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Switch to project..." />
                <CommandList>
                  <CommandEmpty>No projects found.</CommandEmpty>
                  <CommandGroup heading="Recent Projects">
                    <CommandItem>
                      <span>Web Application</span>
                      <CommandShortcut>Active</CommandShortcut>
                    </CommandItem>
                    <CommandItem>
                      <span>Mobile App</span>
                    </CommandItem>
                    <CommandItem>
                      <span>API Service</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="All Projects">
                    <CommandItem>
                      <span>Design System</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Documentation Site</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </>
          );
        };
        return <QuickSwitcherExample />;
      })(),
    },
  ],
  dependencies: ['react', 'cmdk', 'lucide-react', '@radix-ui/react-dialog'],
  tags: ['command', 'palette', 'search', 'keyboard', 'navigation', 'shortcuts', 'dialog'],
};
