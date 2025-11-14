import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders switch', () => {
    render(<Switch aria-label="Test switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('handles checked state', () => {
    render(<Switch checked aria-label="Test switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('handles unchecked state', () => {
    render(<Switch checked={false} aria-label="Test switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('calls onCheckedChange when toggled', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} aria-label="Test switch" />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Switch disabled aria-label="Test switch" />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<Switch className="custom-switch" aria-label="Test switch" />);
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toHaveClass('custom-switch');
  });
});
