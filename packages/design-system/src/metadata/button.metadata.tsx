
import type { ComponentMetadata } from '../types/component.types';
import { Button } from '../components/button';

export const buttonMetadata: ComponentMetadata = {
  id: 'button',
  name: 'Button',
  description: 'Interactive button element with 6 variants and multiple sizes',
  category: 'form',
  variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Variants</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">States</h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Disabled</Button>
        </div>
      </div>
    </div>
  ),
  props: [
    {
      name: 'variant',
      type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
      description: 'Button style variant',
      required: false,
      defaultValue: '"default"'
    },
    {
      name: 'size',
      type: '"sm" | "default" | "lg" | "icon"',
      description: 'Button size',
      required: false,
      defaultValue: '"default"'
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable button interaction',
      required: false,
      defaultValue: 'false'
    },
    {
      name: 'asChild',
      type: 'boolean',
      description: 'Change the component to the HTML tag or custom component of the only child',
      required: false,
      defaultValue: 'false'
    },
    {
      name: 'onClick',
      type: '() => void',
      description: 'Click handler callback',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Button content',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Default Button',
      description: 'Standard button with default styling',
      code: `<Button variant="default" onClick={() => console.log('clicked')}>
  Click me
</Button>`,
      language: 'tsx',
      preview: <Button variant="default">Click me</Button>
    },
    {
      title: 'Destructive Button',
      description: 'Button for destructive actions like delete or remove',
      code: `<Button variant="destructive">
  Delete
</Button>`,
      language: 'tsx',
      preview: <Button variant="destructive">Delete</Button>
    },
    {
      title: 'Outline Button',
      description: 'Button with outline styling for secondary actions',
      code: `<Button variant="outline">
  Cancel
</Button>`,
      language: 'tsx',
      preview: <Button variant="outline">Cancel</Button>
    },
    {
      title: 'Secondary Button',
      description: 'Button with secondary styling',
      code: `<Button variant="secondary">
  Secondary Action
</Button>`,
      language: 'tsx',
      preview: <Button variant="secondary">Secondary Action</Button>
    },
    {
      title: 'Ghost Button',
      description: 'Minimal button with no background until hover',
      code: `<Button variant="ghost">
  Ghost Button
</Button>`,
      language: 'tsx',
      preview: <Button variant="ghost">Ghost Button</Button>
    },
    {
      title: 'Link Button',
      description: 'Button styled as a link',
      code: `<Button variant="link">
  Link Button
</Button>`,
      language: 'tsx',
      preview: <Button variant="link">Link Button</Button>
    },
    {
      title: 'Button Sizes',
      description: 'Buttons come in small, default, large, and icon sizes',
      code: `<div className="flex gap-4">
  <Button size="sm">Small</Button>
  <Button size="default">Default</Button>
  <Button size="lg">Large</Button>
</div>`,
      language: 'tsx',
      preview: (
        <div className="flex gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      )
    },
    {
      title: 'Disabled Button',
      description: 'Button in disabled state',
      code: `<Button disabled>
  Disabled
</Button>`,
      language: 'tsx',
      preview: <Button disabled>Disabled</Button>
    }
  ],
  dependencies: ['react', 'class-variance-authority'],
  tags: ['button', 'interactive', 'form', 'clickable', 'action']
};
