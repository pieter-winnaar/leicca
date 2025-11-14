/**
 * Alert Component Tests
 *
 * Tests for shadcn/ui Alert component
 * Verifies variants, compound components, and theme integration
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('should render with children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('should have role="alert" attribute', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    render(<Alert>Default Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-background');
    expect(alert).toHaveClass('text-foreground');
  });

  it('should apply destructive variant styles', () => {
    render(<Alert variant="destructive">Error Alert</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('border-destructive/50');
    expect(alert).toHaveClass('text-destructive');
  });

  it('should accept custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Alert ref={ref}>Ref Alert</Alert>);
    expect(ref).toHaveBeenCalled();
  });

  it('should spread additional HTML attributes', () => {
    render(<Alert data-testid="test-alert">Test</Alert>);
    expect(screen.getByTestId('test-alert')).toBeInTheDocument();
  });

  it('should render with AlertTitle', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('should render with AlertDescription', () => {
    render(
      <Alert>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Alert description text')).toBeInTheDocument();
  });

  it('should render complete alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Error Occurred</AlertTitle>
        <AlertDescription>Please check your input and try again.</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
    expect(screen.getByText('Please check your input and try again.')).toBeInTheDocument();
  });
});

describe('AlertTitle', () => {
  it('should render with children', () => {
    render(<AlertTitle>Title Text</AlertTitle>);
    expect(screen.getByText('Title Text')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<AlertTitle>Title</AlertTitle>);
    const title = screen.getByText('Title');
    expect(title).toHaveClass('font-medium');
    expect(title).toHaveClass('leading-none');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<AlertTitle ref={ref}>Title</AlertTitle>);
    expect(ref).toHaveBeenCalled();
  });
});

describe('AlertDescription', () => {
  it('should render with children', () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<AlertDescription>Description</AlertDescription>);
    const description = screen.getByText('Description');
    expect(description).toHaveClass('text-sm');
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<AlertDescription ref={ref}>Description</AlertDescription>);
    expect(ref).toHaveBeenCalled();
  });
});
