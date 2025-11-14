"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '../components/sheet';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Badge } from '../components/badge';
import { Separator } from '../components/separator';
import { ScrollArea } from '../components/scroll-area';
import { ShoppingCart, Bell, Search } from 'lucide-react';

// Preview wrapper components with state
function MainPreview() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UserSettingsPreview() {
  const [name, setName] = React.useState('John Doe');
  const [email, setEmail] = React.useState('john@example.com');
  const [notifications, setNotifications] = React.useState(true);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">User Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Settings</SheetTitle>
          <SheetDescription>
            Update your account preferences and profile information
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full Name</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email Address</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingCartPreview() {
  const [items] = React.useState([
    { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1 },
    { id: 2, name: 'USB-C Cable', price: 19.99, quantity: 2 },
    { id: 3, name: 'Phone Case', price: 29.99, quantity: 1 },
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
            {items.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 py-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <SheetFooter>
            <Button className="w-full">Proceed to Checkout</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationCenterPreview() {
  const [notifications] = React.useState([
    {
      id: 1,
      title: 'New message received',
      description: 'You have a new message from Sarah',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payment processed',
      description: 'Your payment of $99.99 was successful',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Order shipped',
      description: 'Your order #12345 has been shipped',
      time: '1d ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4 py-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.unread ? 'bg-accent' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.time}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <Button variant="outline" className="w-full">
            Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function CommandMenuPreview() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const actions = [
    { id: 1, title: 'Create new project', shortcut: '⌘N' },
    { id: 2, title: 'Open settings', shortcut: '⌘,' },
    { id: 3, title: 'Search files', shortcut: '⌘P' },
    { id: 4, title: 'View documentation', shortcut: '⌘?' },
    { id: 5, title: 'Sign out', shortcut: '⌘Q' },
  ];

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Command Menu
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>Search for commands and actions</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Separator />
          <div className="space-y-1">
            {filteredActions.length > 0 ? (
              filteredActions.map((action) => (
                <button
                  key={action.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                >
                  <span className="text-sm">{action.title}</span>
                  <kbd className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                    {action.shortcut}
                  </kbd>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No commands found
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export const sheetMetadata: ComponentMetadata = {
  id: 'sheet',
  name: 'Sheet',
  description: 'Slide-out panel component for additional content or forms - now with 5 business use case examples',
  category: 'overlay',
  variants: ['right', 'left', 'top', 'bottom'],
  preview: <MainPreview />,
  props: [
    {
      name: 'side',
      type: '"right" | "left" | "top" | "bottom"',
      description: 'The side from which the sheet slides in',
      required: false,
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The content to display in the sheet',
      required: true,
    },
  ],
  examples: [
    {
      title: 'User Settings Form',
      description: 'Sheet with user settings form including name, email, and notification preferences',
      code: `'use client'

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';

export function UserSettingsSheet() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [notifications, setNotifications] = useState(true);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">User Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>User Settings</SheetTitle>
          <SheetDescription>
            Update your account preferences and profile information
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates via email
              </p>
            </div>
            <Button
              variant={notifications ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}`,
      language: 'tsx',
      preview: <UserSettingsPreview />,
    },
    {
      title: 'Shopping Cart',
      description: 'E-commerce shopping cart with item list, quantity, prices, and checkout button',
      code: `'use client'

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Separator } from '@/components/separator';
import { ScrollArea } from '@/components/scroll-area';
import { ShoppingCart } from 'lucide-react';

export function ShoppingCartSheet() {
  const [items, setItems] = useState([
    { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1 },
    { id: 2, name: 'USB-C Cable', price: 19.99, quantity: 2 },
    { id: 3, name: 'Phone Case', price: 29.99, quantity: 1 },
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Cart
          <Badge variant="destructive" className="ml-2">
            {items.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {items.length} items in your cart
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4 py-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × \${item.price.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  \${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="my-4" />
        <div className="space-y-4">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>\${total.toFixed(2)}</span>
          </div>
          <SheetFooter>
            <Button className="w-full">Proceed to Checkout</Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}`,
      language: 'tsx',
      preview: <ShoppingCartPreview />,
    },
    {
      title: 'Notification Center',
      description: 'Notification panel with unread indicators, timestamps, and mark-as-read functionality',
      code: `'use client'

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import { Bell } from 'lucide-react';

export function NotificationCenterSheet() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New message received',
      description: 'You have a new message from Sarah',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Payment processed',
      description: 'Your payment of \$99.99 was successful',
      time: '2h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Order shipped',
      description: 'Your order #12345 has been shipped',
      time: '1d ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            You have {unreadCount} unread notifications
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4 py-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={\`p-4 rounded-lg border \${
                  notification.unread ? 'bg-accent' : 'bg-background'
                }\`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.time}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter className="mt-4">
          <Button variant="outline" className="w-full">
            Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}`,
      language: 'tsx',
      preview: <NotificationCenterPreview />,
    },
    {
      title: 'Command Menu',
      description: 'Quick actions panel with search functionality and keyboard shortcuts',
      code: `'use client'

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Separator } from '@/components/separator';
import { Search } from 'lucide-react';

export function CommandMenuSheet() {
  const [searchQuery, setSearchQuery] = useState('');

  const actions = [
    { id: 1, title: 'Create new project', shortcut: '⌘N' },
    { id: 2, title: 'Open settings', shortcut: '⌘,' },
    { id: 3, title: 'Search files', shortcut: '⌘P' },
    { id: 4, title: 'View documentation', shortcut: '⌘?' },
    { id: 5, title: 'Sign out', shortcut: '⌘Q' },
  ];

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Command Menu
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Quick Actions</SheetTitle>
          <SheetDescription>
            Search for commands and actions
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Separator />
          <div className="space-y-1">
            {filteredActions.length > 0 ? (
              filteredActions.map((action) => (
                <button
                  key={action.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left"
                >
                  <span className="text-sm">{action.title}</span>
                  <kbd className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                    {action.shortcut}
                  </kbd>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No commands found
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}`,
      language: 'tsx',
      preview: <CommandMenuPreview />,
    },
    {
      title: 'Left Side Navigation',
      description: 'Sheet sliding from the left for navigation menus or filters',
      code: `<Sheet>
  <SheetTrigger asChild>
    <Button variant="default">Open Navigation</Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
      <SheetDescription>
        Quick navigation menu
      </SheetDescription>
    </SheetHeader>
    <div className="space-y-4 py-4">
      <Button variant="ghost" className="w-full justify-start">
        Dashboard
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        Projects
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        Settings
      </Button>
    </div>
  </SheetContent>
</Sheet>`,
      language: 'tsx',
      preview: (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default">Left Navigation</Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>Quick navigation menu</SheetDescription>
            </SheetHeader>
            <div className="space-y-2 py-4">
              <Button variant="ghost" className="w-full justify-start">
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Projects
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-dialog', 'lucide-react'],
  tags: ['sheet', 'drawer', 'sidebar', 'panel', 'overlay', 'slide-out', 'cart', 'notifications', 'settings'],
};
