
import type { ComponentMetadata } from '../types/component.types';
import { Progress } from '../components/progress';

export const progressMetadata: ComponentMetadata = {
  id: 'progress',
  name: 'Progress',
  description: 'Displays progress indicator with customizable value',
  category: 'display',
  variants: ['default'],
  preview: (
    <div className="w-full space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">25% Complete</p>
        <Progress value={25} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">50% Complete</p>
        <Progress value={50} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">75% Complete</p>
        <Progress value={75} />
      </div>
    </div>
  ),
  props: [
    {
      name: 'value',
      type: 'number',
      description: 'Progress value (0-100)',
      required: false,
      defaultValue: '0'
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    }
  ],
  examples: [
    {
      title: 'Basic Progress',
      description: 'Progress bar at 50%',
      code: `<Progress value={50} />`,
      language: 'tsx'
    },
    {
      title: 'Progress States',
      description: 'Progress bars showing different completion levels',
      code: `<div className="space-y-4">
  <Progress value={0} />
  <Progress value={25} />
  <Progress value={50} />
  <Progress value={75} />
  <Progress value={100} />
</div>`,
      language: 'tsx'
    },
    {
      title: 'Colored Progress',
      description: 'Progress bar with custom styling',
      code: `<Progress value={60} className="h-2" />`,
      language: 'tsx'
    }
  ],
  dependencies: ['react', '@radix-ui/react-progress'],
  tags: ['progress', 'loading', 'indicator', 'status']
};
