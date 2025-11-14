import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PaymentsTableCard } from '../PaymentsTableCard';

describe('PaymentsTableCard', () => {
  const mockPayments = [
    { id: '1', status: 'Success' as const, email: 'user@example.com', amount: '$310.00' },
    { id: '2', status: 'Processing' as const, email: 'user2@example.com', amount: '$242.00' },
  ];

  it('renders without crashing', () => {
    const { container } = render(<PaymentsTableCard payments={mockPayments} />);
    expect(container).toBeTruthy();
  });
});
