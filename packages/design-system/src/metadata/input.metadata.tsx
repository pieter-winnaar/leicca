"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Eye, EyeOff, Search, FileUp } from 'lucide-react';

// Preview wrapper components with state
function MainPreview() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-foreground">Input Types</h3>
        <div className="space-y-3 max-w-md">
          <Input type="text" placeholder="Text input..." />
          <Input type="email" placeholder="Email input..." />
          <Input type="password" placeholder="Password..." />
          <Input type="text" placeholder="Disabled" disabled />
        </div>
      </div>
    </div>
  );
}

function PasswordTogglePreview() {
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click the eye icon to toggle password visibility
      </p>
    </div>
  );
}

function SearchIconPreview() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="search">Search</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>
      {searchQuery && (
        <p className="text-xs text-muted-foreground">
          Searching for: "{searchQuery}"
        </p>
      )}
    </div>
  );
}

function EmailValidationPreview() {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  return (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="email-validation">Email Address</Label>
      <Input
        id="email-validation"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="you@example.com"
        className={error ? 'border-destructive' : ''}
        aria-invalid={!!error}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && (
        <p id="email-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {email && !error && (
        <p className="text-sm text-green-600">
          ✓ Valid email address
        </p>
      )}
    </div>
  );
}

function PhoneFormattingPreview() {
  const [phone, setPhone] = React.useState('');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const formatted = [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('-');
      return formatted;
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="phone">Phone Number</Label>
      <Input
        id="phone"
        type="tel"
        value={phone}
        onChange={handleChange}
        placeholder="555-123-4567"
        maxLength={12}
      />
      <p className="text-xs text-muted-foreground">
        Format: XXX-XXX-XXXX (auto-formatted)
      </p>
    </div>
  );
}

function FileInputPreview() {
  const [fileName, setFileName] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="space-y-2 max-w-md">
      <Label htmlFor="file-upload">Upload Document</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
        >
          <FileUp className="h-4 w-4" />
          <span className="text-sm font-medium">Choose File</span>
        </label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />
        {fileName && (
          <span className="text-sm text-muted-foreground truncate flex-1">
            {fileName}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Accepts: PDF, DOC, DOCX (max 10MB)
      </p>
    </div>
  );
}

export const inputMetadata: ComponentMetadata = {
  id: 'input',
  name: 'Input',
  description: 'Form input with support for text, email, password, and other HTML input types - now with 7 practical examples',
  category: 'form',
  variants: ['text', 'email', 'password', 'search', 'tel', 'file', 'disabled'],
  preview: <MainPreview />,
  props: [
    {
      name: 'type',
      type: '"text" | "email" | "password" | "number" | "tel" | "url" | "search" | "file"',
      description: 'Input type',
      required: false,
      defaultValue: '"text"'
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
      description: 'Disable input interaction',
      required: false,
      defaultValue: 'false'
    },
    {
      name: 'value',
      type: 'string',
      description: 'Controlled input value',
      required: false,
    },
    {
      name: 'onChange',
      type: '(e: React.ChangeEvent<HTMLInputElement>) => void',
      description: 'Change handler callback',
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
      title: 'Password with Toggle Visibility',
      description: 'Password input with show/hide toggle button for better UX',
      code: `'use client'

import { useState } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordToggle() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}`,
      language: 'tsx',
      preview: <PasswordTogglePreview />
    },
    {
      title: 'Search Input with Icon',
      description: 'Search field with magnifying glass icon prefix for visual clarity',
      code: `'use client'

import { useState } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Search } from 'lucide-react';

export function SearchInput() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-2">
      <Label htmlFor="search">Search</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>
    </div>
  );
}`,
      language: 'tsx',
      preview: <SearchIconPreview />
    },
    {
      title: 'Email Input with Validation',
      description: 'Email field with real-time validation and error state display',
      code: `'use client'

import { useState } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';

export function EmailValidation() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setError('');
      return;
    }
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(value)) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="you@example.com"
        className={error ? 'border-destructive' : ''}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {email && !error && (
        <p className="text-sm text-green-600">
          ✓ Valid email address
        </p>
      )}
    </div>
  );
}`,
      language: 'tsx',
      preview: <EmailValidationPreview />
    },
    {
      title: 'Phone Number with Auto-Formatting',
      description: 'Phone input that automatically formats as user types (XXX-XXX-XXXX)',
      code: `'use client'

import { useState } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';

export function PhoneFormatting() {
  const [phone, setPhone] = useState('');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\\D/g, '');
    const match = cleaned.match(/^(\\d{0,3})(\\d{0,3})(\\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]]
        .filter(Boolean)
        .join('-');
    }
    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <Input
        id="phone"
        type="tel"
        value={phone}
        onChange={handleChange}
        placeholder="555-123-4567"
        maxLength={12}
      />
      <p className="text-xs text-muted-foreground">
        Format: XXX-XXX-XXXX (auto-formatted)
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <PhoneFormattingPreview />
    },
    {
      title: 'Custom Styled File Upload',
      description: 'File input with custom button styling and file name display',
      code: `'use client'

import { useState } from 'react';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { FileUp } from 'lucide-react';

export function FileUpload() {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload Document</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor="file-upload"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer"
        >
          <FileUp className="h-4 w-4" />
          <span className="text-sm font-medium">Choose File</span>
        </label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx"
        />
        {fileName && (
          <span className="text-sm text-muted-foreground truncate">
            {fileName}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Accepts: PDF, DOC, DOCX (max 10MB)
      </p>
    </div>
  );
}`,
      language: 'tsx',
      preview: <FileInputPreview />
    },
    {
      title: 'Text Input',
      description: 'Basic text input field',
      code: `<Input type="text" placeholder="Enter text..." />`,
      language: 'tsx',
      preview: <Input type="text" placeholder="Enter text..." />
    },
    {
      title: 'Disabled Input',
      description: 'Input in disabled state',
      code: `<Input type="text" placeholder="Disabled" disabled />`,
      language: 'tsx',
      preview: <Input type="text" placeholder="Disabled" disabled />
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['input', 'form', 'text', 'field', 'text-field', 'password', 'email', 'search', 'validation', 'file-upload']
};
