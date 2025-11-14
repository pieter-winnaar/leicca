import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollArea } from '../scroll-area';

describe('ScrollArea', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ScrollArea className="h-[200px]">
        <div>Test content</div>
      </ScrollArea>
    );
    expect(container).toBeTruthy();
  });
});
