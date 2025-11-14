/**
 * Button Component Tests
 *
 * Tests for shadcn/ui Button component
 * Verifies variants, sizes, and theme integration
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });

  it('should not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply default variant styles', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByText('Default Button');
    expect(button).toHaveClass('bg-primary');
  });

  it('should apply destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('should apply outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline');
    expect(button).toHaveClass('border');
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-secondary');
  });

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText('Ghost');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('should apply small size styles', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByText('Small');
    expect(button).toHaveClass('h-8');
  });

  it('should apply large size styles', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByText('Large');
    expect(button).toHaveClass('h-10');
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it('should spread additional HTML attributes', () => {
    render(<Button data-testid="test-button">Test</Button>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });
});
