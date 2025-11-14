import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AreaChart } from '../AreaChart';
import { ThemeProvider } from '../ThemeProvider';

describe('AreaChart', () => {
  const mockData = [
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 200 },
  ];

  const areas = [
    { dataKey: 'value', color: '#8884d8', name: 'Value' },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <AreaChart data={mockData} xAxisKey="date" areas={areas} />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });
});
