import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../collapsible';

describe('Collapsible', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Content</CollapsibleContent>
      </Collapsible>
    );
    expect(container).toBeTruthy();
  });
});
