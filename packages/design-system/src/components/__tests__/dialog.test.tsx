/**
 * Dialog Component Tests
 *
 * Tests for shadcn/ui Dialog component
 * Verifies modal functionality, compound components, and theme integration
 */

import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../dialog';
import { Button } from '../button';

describe('Dialog', () => {
  it('should render trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('should render trigger with custom className', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button className="custom-trigger">Custom Trigger</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Custom Trigger')).toHaveClass('custom-trigger');
  });

  it('should render trigger with aria attributes', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Trigger</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });
});

describe('DialogHeader', () => {
  it('should accept custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader className="custom-header" data-testid="header">
            <DialogTitle>Header</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header');
  });
});

describe('DialogFooter', () => {
  it('should accept custom className', () => {
    const { container } = render(
      <DialogFooter className="custom-footer">
        <Button>Footer</Button>
      </DialogFooter>
    );
    const footer = container.querySelector('.custom-footer');
    expect(footer).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <DialogFooter>
        <Button>Cancel</Button>
        <Button>Confirm</Button>
      </DialogFooter>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });
});

describe('DialogTitle', () => {
  it('should render with children', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title Text</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Title Text')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Styled Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const title = screen.getByText('Styled Title');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
  });

  it('should accept custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle className="custom-title">Custom</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const title = screen.getByText('Custom');
    expect(title).toHaveClass('custom-title');
  });
});

describe('DialogDescription', () => {
  it('should render with children', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description Text</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Description Text')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Styled Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const description = screen.getByText('Styled Description');
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should accept custom className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription className="custom-desc">Custom</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const description = screen.getByText('Custom');
    expect(description).toHaveClass('custom-desc');
  });
});
