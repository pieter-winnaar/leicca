import type { ComponentMetadata } from '../types/component.types';
import { Sidebar, defaultNavItems } from '../components/Sidebar';

export const sidebarMetadata: ComponentMetadata = {
  id: 'sidebar',
  name: 'Sidebar',
  description: 'Collapsible navigation sidebar with logo, menu items, and user profile',
  category: 'navigation',
  variants: ['default', 'collapsed'],
  preview: (
    <div className="h-[500px] w-full">
      <Sidebar
        navItems={defaultNavItems}
        activeItem="/"
        userName="John Doe"
        userEmail="john@example.com"
      />
    </div>
  ),
  props: [
    {
      name: 'logo',
      type: 'React.ReactNode',
      description: 'Logo to display at the top of the sidebar',
      required: false,
    },
    {
      name: 'navItems',
      type: 'SidebarNavItem[]',
      description: 'Array of navigation items with label, href, icon, and optional badge',
      required: false,
    },
    {
      name: 'activeItem',
      type: 'string',
      description: 'Currently active item href for highlighting',
      required: false,
    },
    {
      name: 'onNavItemClick',
      type: '(href: string) => void',
      description: 'Callback when a navigation item is clicked',
      required: false,
    },
    {
      name: 'collapsed',
      type: 'boolean',
      description: 'Whether the sidebar is collapsed',
      required: false,
    },
    {
      name: 'onToggleCollapse',
      type: '() => void',
      description: 'Callback when collapse toggle button is clicked',
      required: false,
    },
    {
      name: 'userName',
      type: 'string',
      description: 'User name to display in profile section',
      required: false,
    },
    {
      name: 'userEmail',
      type: 'string',
      description: 'User email to display in profile section',
      required: false,
    },
    {
      name: 'userAvatar',
      type: 'string',
      description: 'User avatar image URL',
      required: false,
    },
    {
      name: 'onLogout',
      type: '() => void',
      description: 'Callback for logout button',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Sidebar',
      description: 'Sidebar with navigation items and user profile',
      code: `const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Team', href: '/team', icon: Users, badge: 3 },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

<Sidebar
  navItems={navItems}
  activeItem="/"
  userName="John Doe"
  userEmail="john@example.com"
/>`,
      language: 'tsx',
      preview: (
        <div className="h-[500px] w-full">
          <Sidebar
            navItems={defaultNavItems}
            activeItem="/"
            userName="John Doe"
            userEmail="john@example.com"
          />
        </div>
      ),
    },
    {
      title: 'Collapsed Sidebar',
      description: 'Sidebar in collapsed state showing only icons',
      code: `<Sidebar
  navItems={navItems}
  activeItem="/"
  collapsed={true}
  userName="John Doe"
/>`,
      language: 'tsx',
      preview: (
        <div className="h-[500px] w-full">
          <Sidebar
            navItems={defaultNavItems}
            activeItem="/"
            collapsed={true}
            userName="John Doe"
          />
        </div>
      ),
    },
  ],
  dependencies: ['react', 'lucide-react', '@radix-ui/react-avatar'],
  tags: ['sidebar', 'navigation', 'menu', 'layout', 'collapsible'],
};
