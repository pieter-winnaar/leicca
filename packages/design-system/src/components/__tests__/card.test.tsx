/**
 * Card Component Tests
 *
 * Tests for shadcn/ui Card compound component
 * Verifies composition and theme integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card', () => {
  it('should render card with content', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply theme card styles', () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-card', 'text-card-foreground');
  });

  it('should accept custom className', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Content
      </Card>
    );
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('should render CardHeader', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should render CardTitle', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('should render CardDescription', () => {
    render(<CardDescription>Card description text</CardDescription>);
    expect(screen.getByText('Card description text')).toBeInTheDocument();
  });

  it('should render CardContent', () => {
    render(<CardContent>Content text</CardContent>);
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('should render CardFooter', () => {
    render(<CardFooter>Footer text</CardFooter>);
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });

  it('should compose full card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>This is a test card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content area</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('This is a test card')).toBeInTheDocument();
    expect(screen.getByText('Main content area')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should apply muted-foreground to description', () => {
    render(<CardDescription data-testid="description">Text</CardDescription>);
    const description = screen.getByTestId('description');
    expect(description).toHaveClass('text-muted-foreground');
  });

  it('should apply semibold to title', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    const title = screen.getByTestId('title');
    expect(title).toHaveClass('font-semibold');
  });
});
