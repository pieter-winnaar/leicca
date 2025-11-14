import type { ComponentMetadata } from '../types/component.types';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../components/hover-card';
import { Avatar, AvatarFallback } from '../components/avatar';
import { Button } from '../components/button';

export const hoverCardMetadata: ComponentMetadata = {
  id: 'hover-card',
  name: 'Hover Card',
  description: 'Display rich content in a popover when hovering over an element',
  category: 'overlay',
  variants: ['default'],
  preview: (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@username</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@username</h4>
            <p className="text-sm text-muted-foreground">
              Software engineer and open source contributor
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">Joined December 2024</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description: 'The content to display in the hover card',
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
      title: 'User Profile Card',
      description: 'Hover card showing user information',
      code: `<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@username</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex space-x-4">
      <Avatar>
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">@username</h4>
        <p className="text-sm text-muted-foreground">
          Software engineer and open source contributor
        </p>
        <div className="flex items-center pt-2">
          <span className="text-xs text-muted-foreground">
            Joined December 2024
          </span>
        </div>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`,
      language: 'tsx',
      preview: (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@username</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex space-x-4">
              <Avatar>
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@username</h4>
                <p className="text-sm text-muted-foreground">
                  Software engineer and open source contributor
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Joined December 2024
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-hover-card'],
  tags: ['hover-card', 'hover', 'card', 'overlay', 'profile', 'preview'],
};
