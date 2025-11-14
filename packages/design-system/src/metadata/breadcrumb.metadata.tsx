
import type { ComponentMetadata } from '../types/component.types';
import { Breadcrumb } from '../components/breadcrumb';

export const breadcrumbMetadata: ComponentMetadata = {
  id: 'breadcrumb',
  name: 'Breadcrumb',
  description: 'Navigation component showing hierarchical page location',
  category: 'navigation',
  variants: ['default'],
  preview: (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Button' },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs' },
          { label: 'Guide' },
        ]}
      />
    </div>
  ),
  props: [
    {
      name: 'items',
      type: 'BreadcrumbItem[]',
      description: 'Array of breadcrumb items with label and optional href',
      required: true,
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
      title: 'Basic Breadcrumb',
      description: 'Simple breadcrumb navigation',
      code: `<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Button' },
  ]}
/>`,
      language: 'tsx',
      preview: (
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Components', href: '/components' },
            { label: 'Button' },
          ]}
        />
      )
    },
    {
      title: 'Deep Navigation',
      description: 'Breadcrumb with multiple levels',
      code: `<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Category', href: '/products/category' },
    { label: 'Item' },
  ]}
/>`,
      language: 'tsx',
      preview: (
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Category', href: '/products/category' },
            { label: 'Item' },
          ]}
        />
      )
    },
    {
      title: 'Current Page Only',
      description: 'Breadcrumb with no links (current page indicator)',
      code: `<Breadcrumb
  items={[
    { label: 'Dashboard' },
  ]}
/>`,
      language: 'tsx',
      preview: (
        <Breadcrumb
          items={[
            { label: 'Dashboard' },
          ]}
        />
      )
    }
  ],
  dependencies: ['react', 'next/link', 'lucide-react'],
  tags: ['breadcrumb', 'navigation', 'hierarchy', 'path', 'location']
};
