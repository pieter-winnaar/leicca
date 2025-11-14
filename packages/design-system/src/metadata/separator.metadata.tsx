
import type { ComponentMetadata } from '../types/component.types';
import { Separator } from '../components/separator';

export const separatorMetadata: ComponentMetadata = {
  id: 'separator',
  name: 'Separator',
  description: 'Visual divider between sections of content',
  category: 'layout',
  variants: ['default'],
  preview: (
    <div className="space-y-6">
      <div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">Section 1</h4>
          <p className="text-sm text-muted-foreground">Content here</p>
        </div>
        <Separator className="my-4" />
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">Section 2</h4>
          <p className="text-sm text-muted-foreground">More content</p>
        </div>
      </div>
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div className="text-foreground">Item 1</div>
        <Separator orientation="vertical" />
        <div className="text-foreground">Item 2</div>
        <Separator orientation="vertical" />
        <div className="text-foreground">Item 3</div>
      </div>
    </div>
  ),
  props: [
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      description: 'Orientation of the separator',
      required: false,
      defaultValue: '"horizontal"'
    },
    {
      name: 'decorative',
      type: 'boolean',
      description: 'Whether separator is purely decorative',
      required: false,
      defaultValue: 'true'
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    }
  ],
  examples: [
    {
      title: 'Horizontal Separator',
      description: 'Default horizontal divider',
      code: `<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium">Section 1</h4>
    <p className="text-sm text-muted-foreground">Content here</p>
  </div>
  <Separator className="my-4" />
  <div className="space-y-1">
    <h4 className="text-sm font-medium">Section 2</h4>
    <p className="text-sm text-muted-foreground">More content</p>
  </div>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Vertical Separator',
      description: 'Vertical divider between inline elements',
      code: `<div className="flex h-5 items-center space-x-4 text-sm">
  <div>Item 1</div>
  <Separator orientation="vertical" />
  <div>Item 2</div>
  <Separator orientation="vertical" />
  <div>Item 3</div>
</div>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-separator'],
  tags: ['separator', 'divider', 'line', 'hr']
};
