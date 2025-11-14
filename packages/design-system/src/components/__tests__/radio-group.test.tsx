import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RadioGroup, RadioGroupItem } from '../radio-group';

describe('RadioGroup', () => {
  it('renders radio group with items', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(2);
  });

  it('handles value selection', () => {
    render(
      <RadioGroup value="option1">
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    const radio1 = screen.getByLabelText('Option 1');
    expect(radio1).toHaveAttribute('data-state', 'checked');
  });

  it('calls onValueChange when selection changes', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup onValueChange={handleChange}>
        <RadioGroupItem value="option1" aria-label="Option 1" />
        <RadioGroupItem value="option2" aria-label="Option 2" />
      </RadioGroup>
    );

    const radio2 = screen.getByLabelText('Option 2');
    fireEvent.click(radio2);
    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('applies custom className to group', () => {
    const { container } = render(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="option1" aria-label="Option 1" />
      </RadioGroup>
    );

    const group = container.querySelector('[role="radiogroup"]');
    expect(group).toHaveClass('custom-group');
  });
});
