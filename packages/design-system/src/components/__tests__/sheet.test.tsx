import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sheet, SheetTrigger, SheetContent } from '../sheet';

describe('Sheet', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    expect(container).toBeTruthy();
  });
});
