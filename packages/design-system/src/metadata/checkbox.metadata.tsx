
import type { ComponentMetadata } from '../types/component.types';
import { Checkbox } from '../components/checkbox';
import { Label } from '../components/label';

export const checkboxMetadata: ComponentMetadata = {
  id: 'checkbox',
  name: 'Checkbox',
  description: 'Checkbox input for boolean selection',
  category: 'form',
  variants: ['default'],
  preview: (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="terms1" defaultChecked />
        <Label htmlFor="terms1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Accept terms and conditions
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms2" />
        <Label htmlFor="terms2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Receive marketing emails
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms3" disabled />
        <Label htmlFor="terms3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Disabled checkbox
        </Label>
      </div>
    </div>
  ),
  props: [
    {
      name: 'checked',
      type: 'boolean',
      description: 'Checked state',
      required: false,
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean) => void',
      description: 'Callback when checked state changes',
      required: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disabled state',
      required: false,
      defaultValue: 'false'
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
      title: 'Basic Checkbox',
      description: 'Simple checkbox with label',
      code: `<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms" className="text-sm font-medium">
    Accept terms and conditions
  </label>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Controlled Checkbox',
      description: 'Checkbox with controlled state',
      code: `const [checked, setChecked] = React.useState(false);

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
/>`,
      language: 'tsx'
    },
    {
      title: 'Disabled Checkbox',
      description: 'Checkbox in disabled state',
      code: `<Checkbox disabled />`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-checkbox'],
  tags: ['checkbox', 'form', 'input', 'toggle', 'boolean']
};
