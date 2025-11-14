/**
 * Badge Component Tests
 *
 * Tests for shadcn/ui Badge component
 * Verifies variants and theme integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('should render with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-primary-foreground');
  });

  it('should apply secondary variant styles', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary');
    expect(badge).toHaveClass('text-secondary-foreground');
  });

  it('should apply destructive variant styles', () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('text-destructive-foreground');
  });

  it('should apply outline variant styles', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('text-foreground');
  });

  it('should accept custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('should spread additional HTML attributes', () => {
    render(<Badge data-testid="test-badge">Test</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('should render with complex children (icon + text)', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<Badge role="status">Status Badge</Badge>);
    const badge = screen.getByRole('status');
    expect(badge).toBeInTheDocument();
  });

  it('should apply base styles for all variants', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge).toHaveClass('items-center');
    expect(badge).toHaveClass('rounded-md');
    expect(badge).toHaveClass('text-xs');
  });
});
