import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Email Address</Label>);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('associates with form element via htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders children correctly', () => {
    render(
      <Label>
        Username <span className="text-destructive">*</span>
      </Label>
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>);
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-label');
  });

  it('renders as label element', () => {
    const { container } = render(<Label>Test</Label>);
    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Test');
  });
});
