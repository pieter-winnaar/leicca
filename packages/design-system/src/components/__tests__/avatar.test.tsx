import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

describe('Avatar', () => {
  it('renders avatar with fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders avatar with image and fallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    // Avatar component exists
    expect(container.firstChild).toBeInTheDocument();
    // Fallback is shown initially (image may not load in test)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Avatar className="custom-avatar">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    const avatar = container.firstChild;
    expect(avatar).toHaveClass('custom-avatar');
  });
});
