
import type { ComponentMetadata } from '../types/component.types';
import { Badge } from '../components/badge';

export const badgeMetadata: ComponentMetadata = {
  id: 'badge',
  name: 'Badge',
  description: 'Interactive badge with 4 variants for status and labels',
  category: 'data-display',
  variants: ['default', 'secondary', 'destructive', 'outline'],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>
    </div>
  ),
  props: [
    {
      name: 'variant',
      type: '"default" | "secondary" | "destructive" | "outline"',
      description: 'Badge style variant',
      required: false,
      defaultValue: '"default"'
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Badge content',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Default Badge',
      description: 'Standard badge with default styling',
      code: `<Badge variant="default">Default</Badge>`,
      language: 'tsx',
      preview: <Badge variant="default">Default</Badge>
    },
    {
      title: 'Secondary Badge',
      description: 'Badge with secondary styling',
      code: `<Badge variant="secondary">Secondary</Badge>`,
      language: 'tsx',
      preview: <Badge variant="secondary">Secondary</Badge>
    },
    {
      title: 'Destructive Badge',
      description: 'Badge for error or warning states',
      code: `<Badge variant="destructive">Error</Badge>`,
      language: 'tsx',
      preview: <Badge variant="destructive">Error</Badge>
    },
    {
      title: 'Outline Badge',
      description: 'Badge with outline styling',
      code: `<Badge variant="outline">Outline</Badge>`,
      language: 'tsx',
      preview: <Badge variant="outline">Outline</Badge>
    },
    {
      title: 'Badge Group',
      description: 'Multiple badges displayed together',
      code: `<div className="flex gap-2">
  <Badge variant="default">New</Badge>
  <Badge variant="secondary">Featured</Badge>
  <Badge variant="outline">Popular</Badge>
</div>`,
      language: 'tsx',
      preview: (
        <div className="flex gap-2">
          <Badge variant="default">New</Badge>
          <Badge variant="secondary">Featured</Badge>
          <Badge variant="outline">Popular</Badge>
        </div>
      )
    },
    {
      title: 'Status Badge',
      description: 'Using badges to show status',
      code: `<div className="flex gap-2">
  <Badge variant="default">Active</Badge>
  <Badge variant="secondary">Pending</Badge>
  <Badge variant="destructive">Inactive</Badge>
</div>`,
      language: 'tsx',
      preview: (
        <div className="flex gap-2">
          <Badge variant="default">Active</Badge>
          <Badge variant="secondary">Pending</Badge>
          <Badge variant="destructive">Inactive</Badge>
        </div>
      )
    }
  ],
  dependencies: ['react', 'class-variance-authority'],
  tags: ['badge', 'label', 'tag', 'status', 'indicator']
};
