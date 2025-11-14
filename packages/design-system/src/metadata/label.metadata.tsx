
import type { ComponentMetadata } from '../types/component.types';
import { Label } from '../components/label';
import { Input } from '../components/input';
import { Checkbox } from '../components/checkbox';

export const labelMetadata: ComponentMetadata = {
  id: 'label',
  name: 'Label',
  description: 'Accessible label for form inputs',
  category: 'form',
  variants: ['default'],
  preview: (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input id="username" placeholder="Enter username" />
      </div>
    </div>
  ),
  props: [
    {
      name: 'htmlFor',
      type: 'string',
      description: 'ID of the form element this label is associated with',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Label content',
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
      title: 'Basic Label',
      description: 'Label associated with an input',
      code: `<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>`,
      language: 'tsx'
    },
    {
      title: 'Label with Checkbox',
      description: 'Label for checkbox input',
      code: `<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Label with Required Indicator',
      description: 'Label showing required field',
      code: `<Label htmlFor="username">
  Username <span className="text-destructive">*</span>
</Label>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-label'],
  tags: ['label', 'form', 'accessibility', 'input']
};
