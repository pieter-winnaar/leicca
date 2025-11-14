import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MoveGoalCard } from '../MoveGoalCard';

describe('MoveGoalCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<MoveGoalCard />);
    expect(container).toBeTruthy();
  });
});
