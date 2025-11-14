/**
 * Payments Table Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { PaymentsTableCard } from '../components/PaymentsTableCard';

const samplePayments = [
  { id: '1', status: 'Success' as const, email: 'olivia@example.com', amount: '$310.00' },
  { id: '2', status: 'Success' as const, email: 'noah@example.com', amount: '$242.00' },
  { id: '3', status: 'Processing' as const, email: 'emma@example.com', amount: '$837.00' },
  { id: '4', status: 'Success' as const, email: 'liam@example.com', amount: '$874.00' },
  { id: '5', status: 'Failed' as const, email: 'ava@example.com', amount: '$721.00' },
];

export const paymentsTableCardMetadata: ComponentMetadata = {
  id: 'payments-table-card',
  name: 'Payments Table Card',
  description: 'Dashboard card displaying payment transactions with status badges',
  category: 'data-display',
  variants: ['default'],
  preview: (
    <PaymentsTableCard
      title="Payments"
      description="Manage your payment history"
      payments={samplePayments}
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Payments',
      description: 'Card title',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Manage your payment history',
      description: 'Card description',
      required: false,
    },
    {
      name: 'payments',
      type: 'PaymentData[]',
      description: 'Array of payment records to display',
      required: true,
    },
    {
      name: 'onRowClick',
      type: '(payment: PaymentData) => void',
      description: 'Callback when a table row is clicked',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Payments Table',
      description: 'Table showing payment transactions with status',
      code: `<PaymentsTableCard
  title="Payments"
  description="Manage your payment history"
  payments={payments}
  onRowClick={(payment) => console.log('Clicked:', payment)}
/>`,
      language: 'tsx',
      preview: (
        <PaymentsTableCard
          title="Payments"
          description="Manage your payment history"
          payments={samplePayments}
        />
      ),
    },
  ],
  dependencies: ['react'],
  tags: ['table', 'payments', 'transactions', 'card', 'dashboard'],
};
