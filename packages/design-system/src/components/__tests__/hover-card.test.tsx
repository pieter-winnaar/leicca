import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../hover-card';

describe('HoverCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <HoverCard>
        <HoverCardTrigger>Hover me</HoverCardTrigger>
        <HoverCardContent>Info</HoverCardContent>
      </HoverCard>
    );
    expect(container).toBeTruthy();
  });
});
