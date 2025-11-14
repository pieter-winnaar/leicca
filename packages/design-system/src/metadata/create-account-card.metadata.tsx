/**
 * Create Account Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { CreateAccountCard } from '../components/CreateAccountCard';

export const createAccountCardMetadata: ComponentMetadata = {
  id: 'create-account-card',
  name: 'Create Account Card',
  description: 'Account creation form card with email/password fields and social login options',
  category: 'forms',
  variants: ['default', 'with-avatar'],
  preview: (
    <CreateAccountCard
      title="Create an account"
      description="Enter your details to get started"
      showAvatar={true}
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Create an account',
      description: 'Card title',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Enter your details to get started',
      description: 'Card description',
      required: false,
    },
    {
      name: 'onAccountSubmit',
      type: '(data: CreateAccountFormData) => void',
      description: 'Callback when form is submitted',
      required: false,
    },
    {
      name: 'onSocialLogin',
      type: "(provider: 'github' | 'google') => void",
      description: 'Callback for social login buttons',
      required: false,
    },
    {
      name: 'submitLabel',
      type: 'string',
      defaultValue: 'Create account',
      description: 'Submit button label',
      required: false,
    },
    {
      name: 'showAvatar',
      type: 'boolean',
      defaultValue: 'true',
      description: 'Whether to show avatar section with chat preview',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Create Account Form',
      description: 'Complete signup form with social login',
      code: `<CreateAccountCard
  title="Create an account"
  description="Enter your details to get started"
  showAvatar={true}
  onAccountSubmit={(data) => console.log('Account created:', data)}
  onSocialLogin={(provider) => console.log('Social login:', provider)}
/>`,
      language: 'tsx',
      preview: (
        <CreateAccountCard
          title="Create an account"
          description="Enter your details to get started"
          showAvatar={true}
        />
      ),
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['form', 'authentication', 'signup', 'card', 'social-login'],
};
