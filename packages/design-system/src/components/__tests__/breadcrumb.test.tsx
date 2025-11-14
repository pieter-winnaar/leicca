import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from '../breadcrumb';

describe('Breadcrumb', () => {
  it('renders breadcrumb items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Button' },
        ]}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ]}
      />
    );

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders last item as current without link', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Current Page' },
        ]}
      />
    );

    const currentItem = screen.getByText('Current Page');
    expect(currentItem.tagName).toBe('SPAN');
    expect(currentItem).not.toHaveAttribute('href');
  });

  it('renders chevron separators between items', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Level 1', href: '/level1' },
          { label: 'Level 2' },
        ]}
      />
    );

    // Should have 2 chevrons for 3 items
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBe(2);
  });

  it('applies custom className', () => {
    const { container } = render(
      <Breadcrumb
        items={[{ label: 'Test' }]}
        className="custom-class"
      />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('handles single item breadcrumb', () => {
    render(
      <Breadcrumb
        items={[{ label: 'Single Item' }]}
      />
    );

    expect(screen.getByText('Single Item')).toBeInTheDocument();
  });

  it('applies correct styling to last item', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'First', href: '/' },
          { label: 'Last' },
        ]}
      />
    );

    const lastItem = screen.getByText('Last');
    expect(lastItem).toHaveClass('text-foreground');
    expect(lastItem).toHaveClass('font-medium');
  });

  it('renders proper aria-label for navigation', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Page' },
        ]}
      />
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});
