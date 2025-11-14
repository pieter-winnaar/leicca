import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders skeleton element', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-full" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-full');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<Skeleton className="h-12 w-12 rounded-full" />);
    const skeleton = container.firstChild;
    expect(skeleton).toHaveClass('h-12');
    expect(skeleton).toHaveClass('w-12');
    expect(skeleton).toHaveClass('rounded-full');
  });
});
