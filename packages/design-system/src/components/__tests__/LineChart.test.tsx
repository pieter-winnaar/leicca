import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LineChart } from '../LineChart';
import { ThemeProvider } from '../ThemeProvider';

describe('LineChart', () => {
  const mockData = [
    { date: '2024-01', value: 100 },
    { date: '2024-02', value: 200 },
  ];

  const lines = [
    { dataKey: 'value', color: '#8884d8', name: 'Value' },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <LineChart data={mockData} xAxisKey="date" lines={lines} />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });
});
