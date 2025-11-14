
import type { ComponentMetadata } from '../types/component.types';
import { Textarea } from '../components/textarea';
import { Label } from '../components/label';

export const textareaMetadata: ComponentMetadata = {
  id: 'textarea',
  name: 'Textarea',
  description: 'Multi-line text input field',
  category: 'form',
  variants: ['default'],
  preview: (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="message">Your message</Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="disabled-message">Disabled textarea</Label>
        <Textarea
          id="disabled-message"
          placeholder="This textarea is disabled"
          disabled
          rows={3}
        />
      </div>
    </div>
  ),
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Current value',
      required: false,
    },
    {
      name: 'onChange',
      type: '(event: React.ChangeEvent<HTMLTextAreaElement>) => void',
      description: 'Callback when value changes',
      required: false,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text',
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
      name: 'rows',
      type: 'number',
      description: 'Number of visible text rows',
      required: false,
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
      title: 'Basic Textarea',
      description: 'Simple multi-line text input',
      code: `<Textarea placeholder="Type your message here..." />`,
      language: 'tsx'
    },
    {
      title: 'Textarea with Label',
      description: 'Textarea with associated label',
      code: `<div className="space-y-2">
  <Label htmlFor="message">Your message</Label>
  <Textarea
    id="message"
    placeholder="Type your message here..."
  />
</div>`,
      language: 'tsx'
    },
    {
      title: 'Controlled Textarea',
      description: 'Textarea with controlled state',
      code: `const [value, setValue] = React.useState("");

<Textarea
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Type something..."
/>`,
      language: 'tsx'
    },
    {
      title: 'Disabled Textarea',
      description: 'Textarea in disabled state',
      code: `<Textarea placeholder="Disabled textarea" disabled />`,
      language: 'tsx'
    }
  ],
  dependencies: ['react'],
  tags: ['textarea', 'form', 'input', 'text', 'multiline']
};
