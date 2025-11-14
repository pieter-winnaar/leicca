import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from '../popover';

describe('Popover', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(container).toBeTruthy();
  });
});
