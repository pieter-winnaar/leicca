import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ExerciseChartCard } from '../ExerciseChartCard';
import { ThemeProvider } from '../ThemeProvider';

describe('ExerciseChartCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemeProvider>
        <ExerciseChartCard />
      </ThemeProvider>
    );
    expect(container).toBeTruthy();
  });
});
