import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MetricCard title="Revenue" value="$1,234" trend={12.5} />
    );
    expect(container).toBeTruthy();
  });

  it('displays title and value', () => {
    render(<MetricCard title="Revenue" value="$1,234" trend={12.5} />);
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('$1,234')).toBeTruthy();
  });
});
