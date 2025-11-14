import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CalendarCard } from '../CalendarCard';

describe('CalendarCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<CalendarCard />);
    expect(container).toBeTruthy();
  });
});
