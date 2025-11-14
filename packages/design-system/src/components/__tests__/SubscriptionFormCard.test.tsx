import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SubscriptionFormCard } from '../SubscriptionFormCard';

describe('SubscriptionFormCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<SubscriptionFormCard />);
    expect(container).toBeTruthy();
  });
});
