import type { ComponentMetadata } from '../types/component.types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/popover';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';

export const popoverMetadata: ComponentMetadata = {
  id: 'popover',
  name: 'Popover',
  description: 'Display rich content in a portal, triggered by a button',
  category: 'overlay',
  variants: ['default'],
  preview: (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Dimensions</h4>
          <p className="text-sm text-muted-foreground">
            Set the dimensions for the layer.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The content to display in the popover',
      required: true,
    },
    {
      name: 'align',
      type: '"start" | "center" | "end"',
      description: 'The preferred alignment against the trigger',
      required: false,
    },
    {
      name: 'sideOffset',
      type: 'number',
      description: 'The distance in pixels from the trigger',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Popover',
      description: 'Popover with text content',
      code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Dimensions</h4>
      <p className="text-sm text-muted-foreground">
        Set the dimensions for the layer.
      </p>
    </div>
  </PopoverContent>
</Popover>`,
      language: 'tsx',
      preview: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Dimensions</h4>
              <p className="text-sm text-muted-foreground">
                Set the dimensions for the layer.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      ),
    },
    {
      title: 'Popover with Form',
      description: 'Popover containing form inputs',
      code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="default">Settings</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="width">Width</Label>
        <Input id="width" defaultValue="100%" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="height">Height</Label>
        <Input id="height" defaultValue="25px" />
      </div>
    </div>
  </PopoverContent>
</Popover>`,
      language: 'tsx',
      preview: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="default">Settings</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" defaultValue="100%" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" defaultValue="25px" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-popover'],
  tags: ['popover', 'popup', 'overlay', 'portal', 'dropdown'],
};
