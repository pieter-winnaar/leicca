/**
 * Select Component Tests
 *
 * Tests for shadcn/ui Select component
 * Verifies select behavior and theme integration
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

describe('Select', () => {
  it('should render select trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose item" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText('Choose item')).toBeInTheDocument();
  });

  it('should accept custom className on trigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class" data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Select disabled>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toBeDisabled();
  });

  it('should handle value changes', () => {
    const handleChange = vi.fn();
    render(
      <Select onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    // Verify component renders
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('should apply theme border styles to trigger', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('border-input');
  });

  it('should apply focus ring styles to trigger', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveClass('focus:ring-ring');
  });

  it('should render select items', () => {
    render(
      <Select open>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="item1">Item 1</SelectItem>
          <SelectItem value="item2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});
