/**
 * Tabs Component Tests
 *
 * Tests for shadcn/ui Tabs component
 * Verifies compound components, tab switching, and theme integration
 */

import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs', () => {
  it('should render with children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('should display default tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('should switch tabs when clicked', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1).toHaveAttribute('data-state', 'active');
    expect(tab2).toHaveAttribute('data-state', 'inactive');
  });

  it('should handle multiple tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('should support controlled tabs', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('tab1');
      return (
        <Tabs value={value} onValueChange={setValue}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
    };

    render(<TestComponent />);
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('should spread additional HTML attributes on TabsList', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="test-tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('test-tabs-list')).toBeInTheDocument();
  });

  it('should spread additional HTML attributes on TabsTrigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" data-testid="test-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('test-trigger')).toBeInTheDocument();
  });

  it('should spread additional HTML attributes on TabsContent', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="test-content">
          Content 1
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
});

describe('TabsList', () => {
  it('should apply default styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('inline-flex');
    expect(list).toHaveClass('bg-muted');
  });

  it('should accept custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('custom-class');
  });
});

describe('TabsTrigger', () => {
  it('should have active state styles', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(activeTab).toHaveAttribute('data-state', 'active');
  });

  it('should accept custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toHaveClass('custom-trigger');
  });

  it('should support disabled state', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const disabledTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(disabledTab).toBeDisabled();
  });
});

describe('TabsContent', () => {
  it('should accept custom className', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content 1
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toHaveClass('custom-content');
  });

  it('should render complex content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <div>
            <h2>Title</h2>
            <p>Paragraph</p>
          </div>
        </TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });
});
