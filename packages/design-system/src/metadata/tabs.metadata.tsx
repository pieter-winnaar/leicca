"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/card';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Badge } from '../components/badge';

// Preview wrapper components
function MainPreview() {
  return (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Tab 1 Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the content for the first tab.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab2" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Tab 2 Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the content for the second tab.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab3" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Tab 3 Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the content for the third tab.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function AccountSettingsPreview() {
  const [name, setName] = React.useState('John Doe');
  const [email, setEmail] = React.useState('john@example.com');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  return (
    <Tabs defaultValue="profile" className="w-full max-w-2xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your password and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="billing" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Manage your subscription and payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Pro - $29/month</p>
              </div>
              <Badge>Active</Badge>
            </div>
            <Button variant="outline">Manage Subscription</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ProductDetailsPreview() {
  return (
    <Tabs defaultValue="description" className="w-full max-w-3xl">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews
          <Badge variant="secondary" className="ml-2">127</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Product Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This premium wireless headphone delivers exceptional sound quality with
              active noise cancellation. Featuring 30-hour battery life and comfortable
              over-ear design, it's perfect for music lovers and professionals alike.
            </p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Active Noise Cancellation (ANC)</li>
                <li>30-hour battery life</li>
                <li>Premium leather ear cups</li>
                <li>Bluetooth 5.0 connectivity</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="specifications" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Driver Size</dt>
                <dd className="font-medium">40mm</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Frequency Response</dt>
                <dd className="font-medium">20Hz - 20kHz</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Impedance</dt>
                <dd className="font-medium">32 Ohm</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Weight</dt>
                <dd className="font-medium">250g</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Connectivity</dt>
                <dd className="font-medium">Bluetooth 5.0, 3.5mm jack</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">4.8</span>
              <div className="text-sm">
                <p className="font-semibold">Excellent</p>
                <p className="text-muted-foreground">Based on 127 reviews</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Sarah J.</span>
                  <span className="text-xs text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Amazing sound quality! The noise cancellation works perfectly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function AnalyticsDashboardPreview() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-4xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="traffic">Traffic</TabsTrigger>
        <TabsTrigger value="conversions">Conversions</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">$45,231</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-2xl">2,350</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.3%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sales</CardDescription>
              <CardTitle className="text-2xl">573</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+9.8%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="traffic" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Direct</span>
              <span className="text-sm font-medium">42%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Organic Search</span>
              <span className="text-sm font-medium">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Social Media</span>
              <span className="text-sm font-medium">23%</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="conversions" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Track your conversion rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Website Visitors</span>
              <span className="text-sm font-medium">10,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Product Views</span>
              <span className="text-sm font-medium">3,456 (33.8%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cart Additions</span>
              <span className="text-sm font-medium">987 (9.6%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Purchases</span>
              <span className="text-sm font-medium">573 (5.6%)</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function VerticalTabsPreview() {
  return (
    <Tabs defaultValue="general" orientation="vertical" className="flex gap-4">
      <TabsList className="flex flex-col h-auto w-48">
        <TabsTrigger value="general" className="w-full justify-start">
          General
        </TabsTrigger>
        <TabsTrigger value="appearance" className="w-full justify-start">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="notifications" className="w-full justify-start">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="privacy" className="w-full justify-start">
          Privacy
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure basic application settings here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Choose themes and display preferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control how and when you receive notifications.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control your data and privacy preferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}

export const tabsMetadata: ComponentMetadata = {
  id: 'tabs',
  name: 'Tabs',
  description: 'Navigation component for organizing content into multiple panels - now with 6 business use case examples',
  category: 'navigation',
  variants: ['default', 'vertical'],
  preview: <MainPreview />,
  props: [
    {
      name: 'defaultValue',
      type: 'string',
      description: 'Default active tab value',
      required: false,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled active tab value',
      required: false,
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: 'Tab change handler',
      required: false,
    },
    {
      name: 'orientation',
      type: '"horizontal" | "vertical"',
      description: 'Tabs orientation',
      required: false,
      defaultValue: '"horizontal"'
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'Tabs content (list and content)',
      required: true,
    }
  ],
  examples: [
    {
      title: 'Account Settings - Profile, Security, Billing',
      description: 'Comprehensive account settings with multiple sections for profile, security, and billing management',
      code: `'use client'

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Badge } from '@/components/badge';

export function AccountSettingsTabs() {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');

  return (
    <Tabs defaultValue="profile" className="w-full max-w-2xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="security" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your password and security preferences
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="billing" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Pro - \$29/month</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}`,
      language: 'tsx',
      preview: <AccountSettingsPreview />,
    },
    {
      title: 'Product Details - Description, Specs, Reviews',
      description: 'E-commerce product page tabs for description, specifications, and customer reviews',
      code: `'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';
import { Card, CardContent } from '@/components/card';
import { Badge } from '@/components/badge';

export function ProductDetailsTabs() {
  return (
    <Tabs defaultValue="description" className="w-full max-w-3xl">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews
          <Badge variant="secondary" className="ml-2">127</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="mt-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Product Overview</h3>
            <p className="text-sm text-muted-foreground">
              Premium wireless headphone with exceptional sound quality.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="specifications" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Driver Size</dt>
                <dd className="font-medium">40mm</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">4.8</span>
              <div className="text-sm">
                <p className="font-semibold">Excellent</p>
                <p className="text-muted-foreground">Based on 127 reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}`,
      language: 'tsx',
      preview: <ProductDetailsPreview />,
    },
    {
      title: 'Analytics Dashboard - Overview, Traffic, Conversions',
      description: 'Dashboard tabs showing different analytics views with metrics and data visualization',
      code: `'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';

export function AnalyticsDashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-4xl">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="traffic">Traffic</TabsTrigger>
        <TabsTrigger value="conversions">Conversions</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl">\$45,231</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="traffic" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Where your visitors are coming from
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="conversions" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your conversion rates
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}`,
      language: 'tsx',
      preview: <AnalyticsDashboardPreview />,
    },
    {
      title: 'Vertical Tabs - Side Navigation Style',
      description: 'Tabs displayed vertically for settings panels or documentation navigation',
      code: `'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/card';

export function VerticalTabs() {
  return (
    <Tabs defaultValue="general" orientation="vertical" className="flex gap-4">
      <TabsList className="flex flex-col h-auto w-48">
        <TabsTrigger value="general" className="w-full justify-start">
          General
        </TabsTrigger>
        <TabsTrigger value="appearance" className="w-full justify-start">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="notifications" className="w-full justify-start">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="privacy" className="w-full justify-start">
          Privacy
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure basic application settings here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Other tab contents... */}
      </div>
    </Tabs>
  );
}`,
      language: 'tsx',
      preview: <VerticalTabsPreview />,
    },
    {
      title: 'Basic Tabs',
      description: 'Simple tabs with default value',
      code: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Content for tab 2
  </TabsContent>
  <TabsContent value="tab3">
    Content for tab 3
  </TabsContent>
</Tabs>`,
      language: 'tsx',
      preview: (
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for tab 1</TabsContent>
          <TabsContent value="tab2">Content for tab 2</TabsContent>
          <TabsContent value="tab3">Content for tab 3</TabsContent>
        </Tabs>
      ),
    },
    {
      title: 'Tabs with Disabled State',
      description: 'Tabs with some triggers disabled',
      code: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Active</TabsTrigger>
    <TabsTrigger value="tab2" disabled>Disabled</TabsTrigger>
    <TabsTrigger value="tab3">Active</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content for tab 1
  </TabsContent>
  <TabsContent value="tab3">
    Content for tab 3
  </TabsContent>
</Tabs>`,
      language: 'tsx',
      preview: (
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Active</TabsTrigger>
            <TabsTrigger value="tab2" disabled>Disabled</TabsTrigger>
            <TabsTrigger value="tab3">Active</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content for tab 1</TabsContent>
          <TabsContent value="tab3">Content for tab 3</TabsContent>
        </Tabs>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-tabs'],
  tags: ['tabs', 'navigation', 'panel', 'tabbed', 'switcher', 'settings', 'dashboard', 'vertical']
};
