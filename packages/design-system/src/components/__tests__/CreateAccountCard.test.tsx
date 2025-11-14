import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CreateAccountCard } from '../CreateAccountCard';

describe('CreateAccountCard', () => {
  it('renders without crashing', () => {
    const { container } = render(<CreateAccountCard />);
    expect(container).toBeTruthy();
  });
});
