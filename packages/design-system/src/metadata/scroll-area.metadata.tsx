import type { ComponentMetadata } from '../types/component.types';
import { ScrollArea } from '../components/scroll-area';
import { Separator } from '../components/separator';

export const scrollAreaMetadata: ComponentMetadata = {
  id: 'scroll-area',
  name: 'Scroll Area',
  description: 'Custom styled scrollable area with overflow handling',
  category: 'layout',
  variants: ['default'],
  preview: (
    <ScrollArea className="h-72 w-full rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>
            <div className="text-sm">
              Item {i + 1}
              <p className="text-muted-foreground">
                This is a scrollable item with content
              </p>
            </div>
            {i < 19 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The content to make scrollable',
      required: true,
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Scroll Area',
      description: 'Scrollable area with list of items',
      code: `<ScrollArea className="h-72 w-full rounded-md border p-4">
  <div className="space-y-4">
    {Array.from({ length: 20 }).map((_, i) => (
      <div key={i}>
        <div className="text-sm">
          Item {i + 1}
        </div>
      </div>
    ))}
  </div>
</ScrollArea>`,
      language: 'tsx',
      preview: (
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i}>
                <div className="text-sm">
                  Item {i + 1}
                  <p className="text-muted-foreground">Scrollable content</p>
                </div>
                {i < 19 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-scroll-area'],
  tags: ['scroll', 'scrollarea', 'overflow', 'scrollbar', 'custom-scroll'],
};
