"use client"

import * as React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { Combobox, type ComboboxOption } from '../components/combobox';
import { Globe, User, Clock, Tag } from 'lucide-react';

// Country data for example
const countries: ComboboxOption[] = [
  { value: 'us', label: 'United States', icon: <Globe className="h-4 w-4" /> },
  { value: 'uk', label: 'United Kingdom', icon: <Globe className="h-4 w-4" /> },
  { value: 'ca', label: 'Canada', icon: <Globe className="h-4 w-4" /> },
  { value: 'au', label: 'Australia', icon: <Globe className="h-4 w-4" /> },
  { value: 'de', label: 'Germany', icon: <Globe className="h-4 w-4" /> },
  { value: 'fr', label: 'France', icon: <Globe className="h-4 w-4" /> },
  { value: 'jp', label: 'Japan', icon: <Globe className="h-4 w-4" /> },
  { value: 'cn', label: 'China', icon: <Globe className="h-4 w-4" /> },
  { value: 'in', label: 'India', icon: <Globe className="h-4 w-4" /> },
  { value: 'br', label: 'Brazil', icon: <Globe className="h-4 w-4" /> },
];

// User data for example
const users: ComboboxOption[] = [
  { value: 'user1', label: 'Alice Johnson', icon: <User className="h-4 w-4" /> },
  { value: 'user2', label: 'Bob Smith', icon: <User className="h-4 w-4" /> },
  { value: 'user3', label: 'Charlie Brown', icon: <User className="h-4 w-4" /> },
  { value: 'user4', label: 'Diana Prince', icon: <User className="h-4 w-4" /> },
  { value: 'user5', label: 'Ethan Hunt', icon: <User className="h-4 w-4" /> },
];

// Timezone data for example
const timezones: ComboboxOption[] = [
  { value: 'utc', label: 'UTC (Coordinated Universal Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'est', label: 'EST (Eastern Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'pst', label: 'PST (Pacific Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'cet', label: 'CET (Central European Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'jst', label: 'JST (Japan Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'aest', label: 'AEST (Australian Eastern Standard Time)', icon: <Clock className="h-4 w-4" /> },
];

// Tag data for example
const tags: ComboboxOption[] = [
  { value: 'blockchain', label: 'Blockchain', icon: <Tag className="h-4 w-4" /> },
  { value: 'bitcoin', label: 'Bitcoin', icon: <Tag className="h-4 w-4" /> },
  { value: 'wallet', label: 'Wallet', icon: <Tag className="h-4 w-4" /> },
  { value: 'transaction', label: 'Transaction', icon: <Tag className="h-4 w-4" /> },
  { value: 'api', label: 'API', icon: <Tag className="h-4 w-4" /> },
  { value: 'security', label: 'Security', icon: <Tag className="h-4 w-4" /> },
];

export const comboboxMetadata: ComponentMetadata = {
  id: 'combobox',
  name: 'Combobox',
  description: 'Searchable select component for large datasets with keyboard navigation',
  category: 'input',
  variants: [],
  preview: (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Combobox Example</h3>
        <Combobox
          options={countries}
          placeholder="Select country..."
          searchPlaceholder="Search countries..."
          className="w-[300px]"
        />
      </div>
    </div>
  ),
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Selected value',
      required: false,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Value change handler',
      required: false,
    },
    {
      name: 'options',
      type: 'ComboboxOption[]',
      description: 'Array of selectable options with value, label, and optional icon',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text when no value selected',
      required: false,
      defaultValue: '"Select option..."',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      description: 'Placeholder text for search input',
      required: false,
      defaultValue: '"Search..."',
    },
    {
      name: 'emptyText',
      type: 'string',
      description: 'Text shown when no results found',
      required: false,
      defaultValue: '"No results found."',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable the combobox',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Country Selector',
      description: 'Searchable country selector for blockchain transactions with international support',
      code: `'use client'

import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/combobox';
import { Globe } from 'lucide-react';

const countries: ComboboxOption[] = [
  { value: 'us', label: 'United States', icon: <Globe className="h-4 w-4" /> },
  { value: 'uk', label: 'United Kingdom', icon: <Globe className="h-4 w-4" /> },
  { value: 'ca', label: 'Canada', icon: <Globe className="h-4 w-4" /> },
  { value: 'au', label: 'Australia', icon: <Globe className="h-4 w-4" /> },
  { value: 'de', label: 'Germany', icon: <Globe className="h-4 w-4" /> },
  { value: 'fr', label: 'France', icon: <Globe className="h-4 w-4" /> },
];

export function CountrySelector() {
  const [country, setCountry] = useState('');

  return (
    <Combobox
      value={country}
      onChange={setCountry}
      options={countries}
      placeholder="Select country..."
      searchPlaceholder="Search countries..."
      emptyText="No country found."
    />
  );
}`,
      language: 'tsx',
      preview: (
        <ComboboxExample
          options={countries}
          placeholder="Select country..."
          searchPlaceholder="Search countries..."
          emptyText="No country found."
        />
      ),
    },
    {
      title: 'User Search',
      description: 'Searchable user selector for wallet sharing and permissions management',
      code: `'use client'

import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/combobox';
import { User } from 'lucide-react';

const users: ComboboxOption[] = [
  { value: 'user1', label: 'Alice Johnson', icon: <User className="h-4 w-4" /> },
  { value: 'user2', label: 'Bob Smith', icon: <User className="h-4 w-4" /> },
  { value: 'user3', label: 'Charlie Brown', icon: <User className="h-4 w-4" /> },
  { value: 'user4', label: 'Diana Prince', icon: <User className="h-4 w-4" /> },
  { value: 'user5', label: 'Ethan Hunt', icon: <User className="h-4 w-4" /> },
];

export function UserSelector() {
  const [selectedUser, setSelectedUser] = useState('');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Share wallet with:</label>
      <Combobox
        value={selectedUser}
        onChange={setSelectedUser}
        options={users}
        placeholder="Select user..."
        searchPlaceholder="Search users by name..."
        emptyText="User not found."
      />
    </div>
  );
}`,
      language: 'tsx',
      preview: (
        <div className="space-y-2">
          <label className="text-sm font-medium">Share wallet with:</label>
          <ComboboxExample
            options={users}
            placeholder="Select user..."
            searchPlaceholder="Search users by name..."
            emptyText="User not found."
          />
        </div>
      ),
    },
    {
      title: 'Tag Input',
      description: 'Searchable tag selector for categorizing blockchain transactions and resources',
      code: `'use client'

import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/combobox';
import { Tag } from 'lucide-react';

const tags: ComboboxOption[] = [
  { value: 'blockchain', label: 'Blockchain', icon: <Tag className="h-4 w-4" /> },
  { value: 'bitcoin', label: 'Bitcoin', icon: <Tag className="h-4 w-4" /> },
  { value: 'wallet', label: 'Wallet', icon: <Tag className="h-4 w-4" /> },
  { value: 'transaction', label: 'Transaction', icon: <Tag className="h-4 w-4" /> },
  { value: 'api', label: 'API', icon: <Tag className="h-4 w-4" /> },
  { value: 'security', label: 'Security', icon: <Tag className="h-4 w-4" /> },
];

export function TagSelector() {
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagSelect = (value: string) => {
    if (value && !selectedTags.includes(value)) {
      setSelectedTags([...selectedTags, value]);
      setSelectedTag('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Transaction Tags:</label>
      <Combobox
        value={selectedTag}
        onChange={handleTagSelect}
        options={tags}
        placeholder="Add tags..."
        searchPlaceholder="Search tags..."
        emptyText="No tags found. Create a new tag?"
      />
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              {tags.find(t => t.value === tag)?.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}`,
      language: 'tsx',
      preview: (
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Tags:</label>
          <ComboboxExample
            options={tags}
            placeholder="Add tags..."
            searchPlaceholder="Search tags..."
            emptyText="No tags found. Create a new tag?"
          />
        </div>
      ),
    },
    {
      title: 'Timezone Picker',
      description: 'Timezone selector for scheduling blockchain transactions and API rate limits',
      code: `'use client'

import { useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/combobox';
import { Clock } from 'lucide-react';

const timezones: ComboboxOption[] = [
  { value: 'utc', label: 'UTC (Coordinated Universal Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'est', label: 'EST (Eastern Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'pst', label: 'PST (Pacific Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'cet', label: 'CET (Central European Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'jst', label: 'JST (Japan Standard Time)', icon: <Clock className="h-4 w-4" /> },
  { value: 'aest', label: 'AEST (Australian Eastern Standard Time)', icon: <Clock className="h-4 w-4" /> },
];

export function TimezoneSelector() {
  const [timezone, setTimezone] = useState('utc');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Transaction Timezone:</label>
      <Combobox
        value={timezone}
        onChange={setTimezone}
        options={timezones}
        placeholder="Select timezone..."
        searchPlaceholder="Search timezones..."
      />
      <p className="text-xs text-muted-foreground">
        All transaction timestamps will use this timezone
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: (
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaction Timezone:</label>
          <ComboboxExample
            options={timezones}
            placeholder="Select timezone..."
            searchPlaceholder="Search timezones..."
          />
          <p className="text-xs text-muted-foreground">
            All transaction timestamps will use this timezone
          </p>
        </div>
      ),
    },
  ],
  dependencies: ['react', 'cmdk', '@radix-ui/react-popover', 'lucide-react'],
  tags: ['combobox', 'select', 'search', 'autocomplete', 'dropdown', 'filter'],
};

// Helper component for examples with state
function ComboboxExample({ options, ...props }: Omit<React.ComponentProps<typeof Combobox>, 'value' | 'onChange'>) {
  const [value, setValue] = React.useState('');
  return <Combobox value={value} onChange={setValue} options={options} {...props} />;
}
