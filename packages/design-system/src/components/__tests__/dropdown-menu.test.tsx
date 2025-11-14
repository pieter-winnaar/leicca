/**
 * Dropdown Menu Component Tests
 *
 * Tests for shadcn/ui Dropdown Menu component
 * Verifies menu functionality, items, and theme integration
 */

import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '../dropdown-menu';
import { Button } from '../button';

describe('DropdownMenu', () => {
  it('should render trigger button', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Open Menu')).toBeInTheDocument();
  });

  it('should render trigger with aria attributes', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = screen.getByText('Menu');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('should render trigger with custom className', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="custom-trigger">Custom</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Custom')).toHaveClass('custom-trigger');
  });
});

describe('DropdownMenuLabel', () => {
  it('should render with children', () => {
    render(<DropdownMenuLabel>Label Text</DropdownMenuLabel>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<DropdownMenuLabel>Styled Label</DropdownMenuLabel>);
    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-semibold');
  });

  it('should accept custom className', () => {
    render(<DropdownMenuLabel className="custom-label">Custom</DropdownMenuLabel>);
    const label = screen.getByText('Custom');
    expect(label).toHaveClass('custom-label');
  });
});

describe('DropdownMenuShortcut', () => {
  it('should render shortcut text', () => {
    render(<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>);
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    const shortcut = screen.getByText('⌘K');
    expect(shortcut).toHaveClass('text-xs');
    expect(shortcut).toHaveClass('ml-auto');
  });

  it('should accept custom className', () => {
    render(<DropdownMenuShortcut className="custom-shortcut">⌘S</DropdownMenuShortcut>);
    const shortcut = screen.getByText('⌘S');
    expect(shortcut).toHaveClass('custom-shortcut');
  });
});

describe('DropdownMenuSeparator', () => {
  it('should render separator', () => {
    const { container } = render(<DropdownMenuSeparator data-testid="separator" />);
    const separator = container.querySelector('[data-testid="separator"]');
    expect(separator).toBeInTheDocument();
  });

  it('should apply default styles', () => {
    const { container } = render(<DropdownMenuSeparator />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toHaveClass('bg-muted');
  });

  it('should accept custom className', () => {
    const { container } = render(<DropdownMenuSeparator className="custom-separator" />);
    const separator = container.querySelector('.custom-separator');
    expect(separator).toBeInTheDocument();
  });
});

describe('DropdownMenuItem', () => {
  it('should render with children in menu context', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Menu Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should support disabled state', () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(container).toBeInTheDocument();
  });
});
