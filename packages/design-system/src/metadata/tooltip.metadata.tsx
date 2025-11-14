import type { ComponentMetadata } from '../types/component.types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/tooltip';
import { Button } from '../components/button';

export const tooltipMetadata: ComponentMetadata = {
  id: 'tooltip',
  name: 'Tooltip',
  description: 'Display contextual information on hover or focus',
  category: 'feedback',
  variants: ['default'],
  preview: (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The content to display in the tooltip',
      required: true,
    },
    {
      name: 'side',
      type: '"top" | "right" | "bottom" | "left"',
      description: 'The preferred side of the trigger to render against',
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
      title: 'Basic Tooltip',
      description: 'Simple tooltip with text content',
      code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      language: 'tsx',
      preview: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      title: 'Positioned Tooltip',
      description: 'Tooltip with custom positioning',
      code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="default">Top tooltip</Button>
    </TooltipTrigger>
    <TooltipContent side="top">
      <p>Positioned on top</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      language: 'tsx',
      preview: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default">Top tooltip</Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Positioned on top</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-tooltip'],
  tags: ['tooltip', 'hover', 'info', 'help', 'feedback'],
};
