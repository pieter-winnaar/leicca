
import type { ComponentMetadata } from '../types/component.types';
import { Slider } from '../components/slider';

export const sliderMetadata: ComponentMetadata = {
  id: 'slider',
  name: 'Slider',
  description: 'Slider input for selecting a value from a range',
  category: 'form',
  variants: ['default'],
  preview: (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Default Slider (50)</p>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Range Slider (25 - 75)</p>
        <Slider defaultValue={[25, 75]} max={100} step={1} />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Step 10 Slider</p>
        <Slider defaultValue={[40]} max={100} step={10} />
      </div>
    </div>
  ),
  props: [
    {
      name: 'value',
      type: 'number[]',
      description: 'Current value(s)',
      required: false,
    },
    {
      name: 'onValueChange',
      type: '(value: number[]) => void',
      description: 'Callback when value changes',
      required: false,
    },
    {
      name: 'min',
      type: 'number',
      description: 'Minimum value',
      required: false,
      defaultValue: '0'
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value',
      required: false,
      defaultValue: '100'
    },
    {
      name: 'step',
      type: 'number',
      description: 'Step increment',
      required: false,
      defaultValue: '1'
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
      title: 'Basic Slider',
      description: 'Simple slider for value selection',
      code: `<Slider defaultValue={[50]} max={100} step={1} />`,
      language: 'tsx'
    },
    {
      title: 'Controlled Slider',
      description: 'Slider with controlled state',
      code: `const [value, setValue] = React.useState([33]);

<div className="space-y-4">
  <Slider
    value={value}
    onValueChange={setValue}
    max={100}
    step={1}
  />
  <p className="text-sm">Value: {value[0]}</p>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Range Slider',
      description: 'Slider with multiple values for range selection',
      code: `<Slider defaultValue={[25, 75]} max={100} step={1} />`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-slider'],
  tags: ['slider', 'range', 'form', 'input', 'number']
};
