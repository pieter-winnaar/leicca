import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../accordion';

describe('Accordion', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Test</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(container).toBeTruthy();
  });
});
