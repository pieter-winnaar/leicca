/**
 * Subscription Form Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { SubscriptionFormCard } from '../components/SubscriptionFormCard';

export const subscriptionFormCardMetadata: ComponentMetadata = {
  id: 'subscription-form-card',
  name: 'Subscription Form Card',
  description: 'Payment form card for subscription upgrade with plan selection and payment details',
  category: 'forms',
  variants: ['default'],
  preview: (
    <SubscriptionFormCard
      title="Upgrade your subscription"
      description="Enter your payment details"
      plans={[
        { id: 'starter', name: 'Starter Plan', price: '$9/month' },
        { id: 'pro', name: 'Pro Plan', price: '$29/month' },
      ]}
      defaultPlan="pro"
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Upgrade your subscription',
      description: 'Card title',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Enter your payment details to upgrade to a premium plan',
      description: 'Card description',
      required: false,
    },
    {
      name: 'plans',
      type: 'SubscriptionPlan[]',
      description: 'Array of subscription plans',
      required: false,
    },
    {
      name: 'defaultPlan',
      type: 'string',
      defaultValue: 'starter',
      description: 'Default selected plan ID',
      required: false,
    },
    {
      name: 'onSubscriptionSubmit',
      type: '(data: SubscriptionFormData) => void',
      description: 'Callback when form is submitted',
      required: false,
    },
    {
      name: 'submitLabel',
      type: 'string',
      defaultValue: 'Subscribe',
      description: 'Submit button label',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Subscription Form',
      description: 'Complete payment form with plan selection',
      code: `<SubscriptionFormCard
  title="Upgrade your subscription"
  plans={[
    { id: 'starter', name: 'Starter Plan', price: '$9/month' },
    { id: 'pro', name: 'Pro Plan', price: '$29/month' },
  ]}
  defaultPlan="pro"
  onSubscriptionSubmit={(data) => console.log('Submitted:', data)}
/>`,
      language: 'tsx',
      preview: (
        <SubscriptionFormCard
          title="Upgrade your subscription"
          plans={[
            { id: 'starter', name: 'Starter Plan', price: '$9/month' },
            { id: 'pro', name: 'Pro Plan', price: '$29/month' },
          ]}
          defaultPlan="pro"
        />
      ),
    },
  ],
  dependencies: ['react'],
  tags: ['form', 'payment', 'subscription', 'card', 'checkout'],
};
