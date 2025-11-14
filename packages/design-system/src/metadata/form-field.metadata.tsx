"use client"

import React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { FormField } from '../components/form-field';
import { Input } from '../components/input';
import { Textarea } from '../components/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/select';
import { Button } from '../components/button';

// Preview wrapper components with state
function MainPreview() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="space-y-6 max-w-md">
      <FormField
        label="Full Name"
        required
        helperText="Enter your first and last name"
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
      </FormField>

      <FormField
        label="Email Address"
        required
        error={emailError}
        helperText={!emailError ? "We'll never share your email" : undefined}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          placeholder="john@example.com"
        />
      </FormField>
    </div>
  );
}

function TextInputValidationPreview() {
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState('');

  const validateUsername = (value: string) => {
    if (value.length === 0) {
      setError('');
      return;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setError('Username can only contain letters, numbers, and underscores');
    } else {
      setError('');
    }
  };

  return (
    <div className="max-w-md">
      <FormField
        label="Username"
        required
        error={error}
        helperText={!error ? 'Choose a unique username for your account' : undefined}
      >
        <Input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(e.target.value);
          }}
          placeholder="johndoe123"
        />
      </FormField>
    </div>
  );
}

function SelectDropdownPreview() {
  const [country, setCountry] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = () => {
    if (!country) {
      setError('Please select a country');
    } else {
      setError('');
      alert(`Country selected: ${country}`);
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <FormField
        label="Country"
        required
        error={error}
        helperText={!error ? 'Select your country of residence' : undefined}
      >
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="fr">France</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

function TextareaCharacterCountPreview() {
  const [bio, setBio] = React.useState('');
  const maxLength = 200;
  const remaining = maxLength - bio.length;
  const isOverLimit = remaining < 0;

  return (
    <div className="max-w-md">
      <FormField
        label="Bio"
        error={isOverLimit ? `Bio is ${Math.abs(remaining)} characters too long` : undefined}
        helperText={!isOverLimit ? `${remaining} characters remaining` : undefined}
      >
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
        />
      </FormField>
    </div>
  );
}

function CustomWidgetIntegrationPreview() {
  const [rating, setRating] = React.useState(0);

  const StarRating = React.forwardRef<
    HTMLDivElement,
    { value: number; onChange: (value: number) => void }
  >(({ value, onChange, ...props }, ref) => {
    return (
      <div ref={ref} className="flex gap-1" {...props}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="text-2xl transition-colors hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            {star <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
    );
  });
  StarRating.displayName = 'StarRating';

  return (
    <div className="max-w-md">
      <FormField
        label="Product Rating"
        required
        helperText="Click to rate from 1 to 5 stars"
      >
        <StarRating value={rating} onChange={setRating} />
      </FormField>
      {rating > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          You rated this product {rating} star{rating !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export const formFieldMetadata: ComponentMetadata = {
  id: 'form-field',
  name: 'FormField',
  description: 'Wrapper for form inputs with label, validation error display, helper text, and required indicator',
  category: 'form',
  variants: ['default', 'with-error', 'with-helper', 'required'],
  preview: <MainPreview />,
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the form field',
      required: true,
    },
    {
      name: 'error',
      type: 'string',
      description: 'Error message to display (shown in red below input)',
      required: false,
    },
    {
      name: 'helperText',
      type: 'string',
      description: 'Helper text to display (shown below input when no error)',
      required: false,
    },
    {
      name: 'required',
      type: 'boolean',
      description: 'Whether the field is required (displays red asterisk)',
      required: false,
      defaultValue: 'false',
    },
    {
      name: 'children',
      type: 'React.ReactElement',
      description: 'The form input element (Input, Textarea, Select, etc.)',
      required: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes for the container',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Text Input with Validation',
      description: 'FormField with input validation showing error messages and helper text',
      code: `'use client'

import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Input } from '@/components/input';

export function UsernameField() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const validateUsername = (value: string) => {
    if (value.length === 0) {
      setError('');
      return;
    }
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setError('Username can only contain letters, numbers, and underscores');
    } else {
      setError('');
    }
  };

  return (
    <FormField
      label="Username"
      required
      error={error}
      helperText={!error ? 'Choose a unique username for your account' : undefined}
    >
      <Input
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          validateUsername(e.target.value);
        }}
        placeholder="johndoe123"
      />
    </FormField>
  );
}`,
      language: 'tsx',
      preview: <TextInputValidationPreview />,
    },
    {
      title: 'Select Dropdown with Validation',
      description: 'FormField wrapping a Select component with required field validation',
      code: `'use client'

import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/select';
import { Button } from '@/components/button';

export function CountrySelect() {
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!country) {
      setError('Please select a country');
    } else {
      setError('');
      alert(\`Country selected: \${country}\`);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        label="Country"
        required
        error={error}
        helperText={!error ? 'Select your country of residence' : undefined}
      >
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}`,
      language: 'tsx',
      preview: <SelectDropdownPreview />,
    },
    {
      title: 'Textarea with Character Count',
      description: 'FormField with textarea showing dynamic character count in helper text',
      code: `'use client'

import { useState } from 'react';
import { FormField } from '@/components/form-field';
import { Textarea } from '@/components/textarea';

export function BioField() {
  const [bio, setBio] = useState('');
  const maxLength = 200;
  const remaining = maxLength - bio.length;
  const isOverLimit = remaining < 0;

  return (
    <FormField
      label="Bio"
      error={isOverLimit ? \`Bio is \${Math.abs(remaining)} characters too long\` : undefined}
      helperText={!isOverLimit ? \`\${remaining} characters remaining\` : undefined}
    >
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us about yourself..."
        rows={4}
      />
    </FormField>
  );
}`,
      language: 'tsx',
      preview: <TextareaCharacterCountPreview />,
    },
    {
      title: 'Custom Widget Integration',
      description: 'FormField wrapping a custom component (star rating) with accessibility support',
      code: `'use client'

import { useState, forwardRef } from 'react';
import { FormField } from '@/components/form-field';

const StarRating = forwardRef<
  HTMLDivElement,
  { value: number; onChange: (value: number) => void }
>(({ value, onChange, ...props }, ref) => {
  return (
    <div ref={ref} className="flex gap-1" {...props}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl transition-colors hover:scale-110"
          aria-label={\`Rate \${star} stars\`}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
});
StarRating.displayName = 'StarRating';

export function ProductRating() {
  const [rating, setRating] = useState(0);

  return (
    <FormField
      label="Product Rating"
      required
      helperText="Click to rate from 1 to 5 stars"
    >
      <StarRating value={rating} onChange={setRating} />
    </FormField>
  );
}`,
      language: 'tsx',
      preview: <CustomWidgetIntegrationPreview />,
    },
  ],
  dependencies: ['react', '@radix-ui/react-label'],
  tags: ['form', 'field', 'input', 'validation', 'error', 'label', 'helper-text', 'required', 'accessibility'],
};
