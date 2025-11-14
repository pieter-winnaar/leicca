import type { ComponentMetadata } from '../types/component.types';
import { Button } from '../components/button';

export const sonnerMetadata: ComponentMetadata = {
  id: 'sonner',
  name: 'Sonner (Toast)',
  description: 'Display toast notifications with ease using Sonner library',
  category: 'feedback',
  variants: ['default', 'success', 'error', 'info'],
  preview: (
    <Button
      variant="outline"
      onClick={() => {
        if (typeof window !== 'undefined') {
          // Dynamic import to avoid SSR issues
          import('sonner').then(({ toast }) => {
            toast('Event has been created', {
              description: 'Monday, January 3rd at 6:00pm',
            });
          });
        }
      }}
    >
      Show Toast
    </Button>
  ),
  props: [
    {
      name: 'message',
      type: 'string | React.ReactNode',
      description: 'The message to display in the toast',
      required: true,
    },
    {
      name: 'description',
      type: 'string | React.ReactNode',
      description: 'Additional description text',
      required: false,
    },
    {
      name: 'duration',
      type: 'number',
      description: 'Duration in milliseconds before auto-dismissing',
      required: false,
    },
    {
      name: 'action',
      type: '{ label: string; onClick: () => void }',
      description: 'Action button configuration',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Toast',
      description: 'Simple toast notification',
      code: `import { toast } from 'sonner';

<Button onClick={() => toast('Event created')}>
  Show Toast
</Button>`,
      language: 'tsx',
      preview: (
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window !== 'undefined') {
              import('sonner').then(({ toast }) => {
                toast('Event has been created');
              });
            }
          }}
        >
          Show Toast
        </Button>
      ),
    },
    {
      title: 'Toast with Description',
      description: 'Toast with additional description',
      code: `import { toast } from 'sonner';

<Button onClick={() =>
  toast('Event created', {
    description: 'Monday, January 3rd at 6:00pm'
  })
}>
  Show Toast
</Button>`,
      language: 'tsx',
      preview: (
        <Button
          variant="default"
          onClick={() => {
            if (typeof window !== 'undefined') {
              import('sonner').then(({ toast }) => {
                toast('Event has been created', {
                  description: 'Monday, January 3rd at 6:00pm',
                });
              });
            }
          }}
        >
          Show Detailed Toast
        </Button>
      ),
    },
    {
      title: 'Success Toast',
      description: 'Toast with success variant',
      code: `import { toast } from 'sonner';

<Button onClick={() =>
  toast.success('Profile updated successfully')
}>
  Success Toast
</Button>`,
      language: 'tsx',
      preview: (
        <Button
          variant="default"
          onClick={() => {
            if (typeof window !== 'undefined') {
              import('sonner').then(({ toast }) => {
                toast.success('Profile updated successfully');
              });
            }
          }}
        >
          Success Toast
        </Button>
      ),
    },
  ],
  dependencies: ['react', 'sonner', 'next-themes'],
  tags: ['toast', 'notification', 'alert', 'feedback', 'sonner', 'message'],
};
