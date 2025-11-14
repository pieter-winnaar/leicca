import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('renders textarea', () => {
    render(<Textarea placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<Textarea placeholder="Type something..." />);
    expect(screen.getByPlaceholderText('Type something...')).toBeInTheDocument();
  });

  it('handles value prop', () => {
    render(<Textarea value="Test value" onChange={() => {}} />);
    const textarea = screen.getByDisplayValue('Test value');
    expect(textarea).toBeInTheDocument();
  });

  it('calls onChange when text changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    const textarea = screen.getByPlaceholderText('Disabled textarea');
    expect(textarea).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" placeholder="Custom" />);
    const textarea = screen.getByPlaceholderText('Custom');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('sets rows attribute', () => {
    render(<Textarea rows={5} placeholder="Multi-line" />);
    const textarea = screen.getByPlaceholderText('Multi-line');
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
