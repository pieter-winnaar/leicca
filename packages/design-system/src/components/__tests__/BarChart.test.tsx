import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BarChart } from '../BarChart';
import { ThemeProvider } from '../ThemeProvider';

describe('BarChart', () => {
  const mockData = [
    { name: 'A', value: 100 },
    { name: 'B', value: 200 },
  ];

  const bars = [
    { dataKey: 'value', color: '#8884d8', name: 'Value' },
  ];

  it('renders without crashing', () => {
    const { container} = render(
      <ThemeProvider>
        <BarChart data={mockData} xAxisKey="name" bars={bars} />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });
});
