import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '../checkbox';

describe('Checkbox', () => {
  it('renders checkbox', () => {
    render(<Checkbox aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Checkbox checked aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('handles unchecked state', () => {
    render(<Checkbox checked={false} aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('calls onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Checkbox disabled aria-label="Test checkbox" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Checkbox className="custom-checkbox" aria-label="Test checkbox" />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveClass('custom-checkbox');
  });
});
