
import type { ComponentMetadata } from '../types/component.types';
import { Switch } from '../components/switch';
import { Label } from '../components/label';

export const switchMetadata: ComponentMetadata = {
  id: 'switch',
  name: 'Switch',
  description: 'Toggle switch for on/off states',
  category: 'form',
  variants: ['default'],
  preview: (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" defaultChecked />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="notifications" />
        <Label htmlFor="notifications">Enable Notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="disabled" disabled />
        <Label htmlFor="disabled">Disabled Switch</Label>
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
      title: 'Basic Switch',
      description: 'Simple toggle switch with label',
      code: `<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Controlled Switch',
      description: 'Switch with controlled state',
      code: `const [enabled, setEnabled] = React.useState(false);

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
/>`,
      language: 'tsx'
    },
    {
      title: 'Disabled Switch',
      description: 'Switch in disabled state',
      code: `<Switch disabled />`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-switch'],
  tags: ['switch', 'toggle', 'form', 'input', 'boolean']
};
