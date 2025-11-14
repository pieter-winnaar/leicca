
import type { ComponentMetadata } from '../types/component.types';
import { Avatar, AvatarImage, AvatarFallback } from '../components/avatar';

export const avatarMetadata: ComponentMetadata = {
  id: 'avatar',
  name: 'Avatar',
  description: 'Displays user avatar with image and fallback support',
  category: 'display',
  variants: ['default'],
  preview: (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
  props: [
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    }
  ],
  examples: [
    {
      title: 'Avatar with Image',
      description: 'Avatar displaying user image',
      code: `<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>`,
      language: 'tsx'
    },
    {
      title: 'Avatar with Fallback',
      description: 'Avatar showing fallback initials when no image',
      code: `<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
      language: 'tsx'
    },
    {
      title: 'Avatar Sizes',
      description: 'Avatars in different sizes',
      code: `<div className="flex gap-4">
  <Avatar className="h-8 w-8">
    <AvatarFallback>SM</AvatarFallback>
  </Avatar>
  <Avatar>
    <AvatarFallback>MD</AvatarFallback>
  </Avatar>
  <Avatar className="h-16 w-16">
    <AvatarFallback>LG</AvatarFallback>
  </Avatar>
</div>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-avatar'],
  tags: ['avatar', 'user', 'profile', 'image']
};
