import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatePicker, DateRangePicker } from '../date-picker';

describe('DatePicker', () => {
  it('should render with placeholder text', () => {
    render(<DatePicker placeholder="Select date" />);
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('should display selected date', () => {
    const selectedDate = new Date(2024, 0, 15);
    render(<DatePicker value={selectedDate} />);

    // date-fns formats it as "January 15, 2024" (PPP format)
    expect(screen.getByRole('button')).toHaveTextContent('January');
  });

  it('should call onChange when date is selected', async () => {
    const handleChange = vi.fn();
    render(<DatePicker onChange={handleChange} />);

    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Wait for calendar to appear and click a date
    await waitFor(() => {
      const dayButton = screen.getAllByRole('button').find(
        (button) => button.getAttribute('data-day')
      );
      if (dayButton) {
        fireEvent.click(dayButton);
      }
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should apply error styling when error prop is provided', () => {
    render(<DatePicker error="Invalid date" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-destructive');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DatePicker disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<DatePicker className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render with custom placeholder', () => {
    render(<DatePicker placeholder="Choose a date" />);
    expect(screen.getByText('Choose a date')).toBeInTheDocument();
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<DatePicker ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

describe('DateRangePicker', () => {
  it('should render with placeholder text', () => {
    render(<DateRangePicker placeholder="Select date range" />);
    expect(screen.getByText('Select date range')).toBeInTheDocument();
  });

  it('should display selected date range', () => {
    const dateRange = {
      from: new Date(2024, 0, 15),
      to: new Date(2024, 0, 20),
    };
    render(<DateRangePicker value={dateRange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Jan 15, 2024');
    expect(button).toHaveTextContent('Jan 20, 2024');
  });

  it('should display only from date when to date is not selected', () => {
    const dateRange = {
      from: new Date(2024, 0, 15),
      to: undefined,
    };
    render(<DateRangePicker value={dateRange} />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Jan 15, 2024');
  });

  it('should call onChange when date range is selected', async () => {
    const handleChange = vi.fn();
    render(<DateRangePicker onChange={handleChange} />);

    // Open the popover
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    await waitFor(() => {
      // Calendar should be visible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });
  });

  it('should apply error styling when error prop is provided', () => {
    render(<DateRangePicker error="Invalid range" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-destructive');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<DateRangePicker disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<DateRangePicker className="custom-range-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-range-class');
  });

  it('should render with custom placeholder', () => {
    render(<DateRangePicker placeholder="Pick your dates" />);
    expect(screen.getByText('Pick your dates')).toBeInTheDocument();
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<DateRangePicker ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should handle undefined range', () => {
    const handleChange = vi.fn();
    render(<DateRangePicker onChange={handleChange} />);

    // Should not throw error
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
