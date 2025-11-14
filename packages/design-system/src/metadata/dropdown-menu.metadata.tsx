
import type { ComponentMetadata } from '../types/component.types';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/dropdown-menu';
import { Button } from '../components/button';

export const dropdownMenuMetadata: ComponentMetadata = {
  id: 'dropdown-menu',
  name: 'Dropdown Menu',
  description: 'Context menu component for actions and navigation',
  category: 'navigation',
  variants: ['default'],
  preview: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  props: [
    {
      name: 'open',
      type: 'boolean',
      description: 'Controlled open state',
      required: false,
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: 'Open state change handler',
      required: false,
    },
    {
      name: 'modal',
      type: 'boolean',
      description: 'Whether the dropdown is modal',
      required: false,
      defaultValue: 'true'
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Dropdown content (trigger and content)',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Basic Dropdown Menu',
      description: 'Simple dropdown with menu items',
      code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
    <DropdownMenuItem>Item 3</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Groups',
      description: 'Dropdown with grouped menu items',
      code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuGroup>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Team</DropdownMenuItem>
      <DropdownMenuItem>Invite</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Labels',
      description: 'Dropdown with section labels',
      code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Billing</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Icons',
      description: 'Dropdown menu items with icons',
      code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      <span>Profile</span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      <span>Settings</span>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Shortcuts',
      description: 'Dropdown with keyboard shortcuts',
      code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Edit</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      Undo
      <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Redo
      <DropdownMenuShortcut>⌘Y</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      Cut
      <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Copy
      <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      Paste
      <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Checkboxes',
      description: 'Dropdown with checkbox items',
      code: `const [checked, setChecked] = useState({
  option1: true,
  option2: false,
});

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Options</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem
      checked={checked.option1}
      onCheckedChange={(value) =>
        setChecked({ ...checked, option1: value })
      }
    >
      Option 1
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem
      checked={checked.option2}
      onCheckedChange={(value) =>
        setChecked({ ...checked, option2: value })
      }
    >
      Option 2
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    },
    {
      title: 'Dropdown with Radio Group',
      description: 'Dropdown with radio button items',
      code: `const [value, setValue] = useState('option1');

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Select</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
      <DropdownMenuRadioItem value="option1">
        Option 1
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="option2">
        Option 2
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="option3">
        Option 3
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-dropdown-menu'],
  tags: ['dropdown', 'menu', 'context-menu', 'actions', 'navigation']
};
