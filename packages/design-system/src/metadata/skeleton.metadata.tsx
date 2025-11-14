
import type { ComponentMetadata } from '../types/component.types';
import { Skeleton } from '../components/skeleton';

export const skeletonMetadata: ComponentMetadata = {
  id: 'skeleton',
  name: 'Skeleton',
  description: 'Loading placeholder skeleton component',
  category: 'display',
  variants: ['default'],
  preview: (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-[125px] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
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
      title: 'Basic Skeleton',
      description: 'Simple loading skeleton',
      code: `<Skeleton className="h-4 w-full" />`,
      language: 'tsx'
    },
    {
      title: 'Card Skeleton',
      description: 'Skeleton placeholder for card content',
      code: `<div className="space-y-3">
  <Skeleton className="h-[125px] w-full rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
</div>`,
      language: 'tsx'
    },
    {
      title: 'Avatar Skeleton',
      description: 'Circular skeleton for avatar loading',
      code: `<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>`,
      language: 'tsx'
    }
  ],
  dependencies: ['react'],
  tags: ['skeleton', 'loading', 'placeholder', 'shimmer']
};
