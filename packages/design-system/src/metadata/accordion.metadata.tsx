import type { ComponentMetadata } from '../types/component.types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/accordion';

export const accordionMetadata: ComponentMetadata = {
  id: 'accordion',
  name: 'Accordion',
  description: 'Vertically stacked set of interactive headings that reveal content',
  category: 'layout',
  variants: ['single', 'multiple'],
  preview: (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern and uses keyboard navigation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that you can customize with CSS.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It uses smooth animations when expanding and collapsing content.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  props: [
    {
      name: 'type',
      type: '"single" | "multiple"',
      description: 'Whether a single or multiple items can be open at once',
      required: true,
    },
    {
      name: 'collapsible',
      type: 'boolean',
      description: 'When type is "single", allows closing the open item',
      required: false,
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      description: 'The default open item(s)',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Single Accordion',
      description: 'Accordion with single item open at a time',
      code: `<Accordion type="single" collapsible className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles.
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
      language: 'tsx',
      preview: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern and uses keyboard navigation.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it styled?</AccordionTrigger>
            <AccordionContent>
              Yes. It comes with default styles that you can customize with CSS.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
    {
      title: 'Multiple Accordion',
      description: 'Accordion allowing multiple items to be open',
      code: `<Accordion type="multiple" className="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>Feature 1</AccordionTrigger>
    <AccordionContent>
      Description of feature 1
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Feature 2</AccordionTrigger>
    <AccordionContent>
      Description of feature 2
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Feature 3</AccordionTrigger>
    <AccordionContent>
      Description of feature 3
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
      language: 'tsx',
      preview: (
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Feature 1</AccordionTrigger>
            <AccordionContent>
              Comprehensive feature with advanced capabilities and seamless integration.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Feature 2</AccordionTrigger>
            <AccordionContent>
              User-friendly interface with intuitive controls and responsive design.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Feature 3</AccordionTrigger>
            <AccordionContent>
              High performance with optimized rendering and efficient data handling.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-accordion', 'lucide-react'],
  tags: ['accordion', 'collapse', 'expand', 'faq', 'disclosure'],
};
