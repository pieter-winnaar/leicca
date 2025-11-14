/**
 * Input Component Tests
 *
 * Tests for shadcn/ui Input component
 * Verifies input behavior and theme integration
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept and display value', () => {
    render(<Input value="test value" readOnly />);
    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('should handle onChange events', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should accept different input types', () => {
    render(<Input type="email" data-testid="email-input" />);
    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should apply theme border styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-input');
  });

  it('should accept custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should spread additional HTML attributes', () => {
    render(<Input data-testid="test-input" aria-label="Test input" />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-label', 'Test input');
  });

  it('should apply focus ring styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('focus-visible:ring-ring');
  });
});
