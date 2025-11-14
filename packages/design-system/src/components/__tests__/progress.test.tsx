import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Progress } from '../progress';

describe('Progress', () => {
  it('renders progress bar', () => {
    const { container } = render(<Progress value={50} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
  });

  it('renders with value', () => {
    const { container } = render(<Progress value={75} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
    // Radix sets max to 100 by default
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />);
    const progress = container.firstChild;
    expect(progress).toHaveClass('custom-progress');
  });

  it('handles zero value', () => {
    const { container } = render(<Progress value={0} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('handles max value', () => {
    const { container } = render(<Progress value={100} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });
});
