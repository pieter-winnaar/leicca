import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevenueCard } from '../RevenueCard';
import { ThemeProvider } from '../ThemeProvider';

describe('RevenueCard', () => {
  const mockData = [
    { month: 'Jan', revenue: 1000 },
    { month: 'Feb', revenue: 1200 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <RevenueCard
          title="Revenue"
          value="$1,234"
          change={12.5}
          data={mockData}
          xAxisKey="month"
          valueKey="revenue"
        />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });

  it('displays title and value', () => {
    render(
      <ThemeProvider>
        <RevenueCard
          title="Revenue"
          value="$1,234"
          change={12.5}
          data={mockData}
          xAxisKey="month"
          valueKey="revenue"
        />
      </ThemeProvider>
    );
    expect(screen.getByText('Revenue')).toBeTruthy();
    expect(screen.getByText('$1,234')).toBeTruthy();
  });
});
