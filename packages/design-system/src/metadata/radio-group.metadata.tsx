
import type { ComponentMetadata } from '../types/component.types';
import { RadioGroup, RadioGroupItem } from '../components/radio-group';
import { Label } from '../components/label';

export const radioGroupMetadata: ComponentMetadata = {
  id: 'radio-group',
  name: 'Radio Group',
  description: 'Radio button group for single selection from multiple options',
  category: 'form',
  variants: ['default'],
  preview: (
    <RadioGroup defaultValue="option-1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">Option 3</Label>
      </div>
    </RadioGroup>
  ),
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Selected value',
      required: false,
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Callback when value changes',
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
      title: 'Basic Radio Group',
      description: 'Radio group with multiple options',
      code: `<RadioGroup defaultValue="option-1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-1" id="option-1" />
    <Label htmlFor="option-1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-2" id="option-2" />
    <Label htmlFor="option-2">Option 2</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-3" id="option-3" />
    <Label htmlFor="option-3">Option 3</Label>
  </div>
</RadioGroup>`,
      language: 'tsx'
    },
    {
      title: 'Controlled Radio Group',
      description: 'Radio group with controlled state',
      code: `const [value, setValue] = React.useState("default");

<RadioGroup value={value} onValueChange={setValue}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="default" id="r1" />
    <Label htmlFor="r1">Default</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="comfortable" id="r2" />
    <Label htmlFor="r2">Comfortable</Label>
  </div>
</RadioGroup>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-radio-group'],
  tags: ['radio', 'form', 'input', 'selection', 'choice']
};
