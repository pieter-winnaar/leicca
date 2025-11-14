import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Combobox, type ComboboxOption } from '../combobox';

const mockOptions: ComboboxOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Combobox', () => {
  it('should render with placeholder', () => {
    render(
      <Combobox
        options={mockOptions}
        placeholder="Select option..."
      />
    );

    expect(screen.getByText('Select option...')).toBeInTheDocument();
  });

  it('should render with selected value', () => {
    render(
      <Combobox
        options={mockOptions}
        value="option1"
        placeholder="Select option..."
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <Combobox
        options={mockOptions}
        placeholder="Select..."
        className="custom-class"
      />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render disabled state', () => {
    render(
      <Combobox
        options={mockOptions}
        placeholder="Select..."
        disabled
      />
    );

    const button = screen.getByRole('combobox');
    expect(button).toBeDisabled();
  });
});
