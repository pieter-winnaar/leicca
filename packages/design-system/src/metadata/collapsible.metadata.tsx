import type { ComponentMetadata } from '../types/component.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/collapsible';
import { Button } from '../components/button';
import { ChevronsUpDown } from 'lucide-react';

export const collapsibleMetadata: ComponentMetadata = {
  id: 'collapsible',
  name: 'Collapsible',
  description: 'Expandable and collapsible content section',
  category: 'layout',
  variants: ['default'],
  preview: (
    <Collapsible className="w-full space-y-2">
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">@username starred 3 repositories</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-2 text-sm">
        @design-system/ui
      </div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 text-sm">@radix-ui/primitives</div>
        <div className="rounded-md border px-4 py-2 text-sm">@tailwindcss/forms</div>
      </CollapsibleContent>
    </Collapsible>
  ),
  props: [
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: 'The open state of the collapsible when initially rendered',
      required: false,
    },
    {
      name: 'open',
      type: 'boolean',
      description: 'The controlled open state of the collapsible',
      required: false,
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: 'Event handler called when the open state changes',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Collapsible',
      description: 'Simple collapsible section',
      code: `<Collapsible className="w-full space-y-2">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-semibold">
      @username starred 3 repositories
    </h4>
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="sm">
        <ChevronsUpDown className="h-4 w-4" />
      </Button>
    </CollapsibleTrigger>
  </div>
  <div className="rounded-md border px-4 py-2 text-sm">
    @design-system/ui
  </div>
  <CollapsibleContent className="space-y-2">
    <div className="rounded-md border px-4 py-2 text-sm">
      @radix-ui/primitives
    </div>
    <div className="rounded-md border px-4 py-2 text-sm">
      @tailwindcss/forms
    </div>
  </CollapsibleContent>
</Collapsible>`,
      language: 'tsx',
      preview: (
        <Collapsible className="w-full space-y-2">
          <div className="flex items-center justify-between space-x-4">
            <h4 className="text-sm font-semibold">@username starred 3 repositories</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            @design-system/ui
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-2 text-sm">@radix-ui/primitives</div>
            <div className="rounded-md border px-4 py-2 text-sm">@tailwindcss/forms</div>
          </CollapsibleContent>
        </Collapsible>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-collapsible', 'lucide-react'],
  tags: ['collapsible', 'expand', 'collapse', 'accordion', 'toggle'],
};
