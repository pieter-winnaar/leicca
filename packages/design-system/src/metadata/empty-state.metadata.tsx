import type { ComponentMetadata } from '../types/component.types';
import { EmptyState } from '../components/empty-state';
import {
  FileX,
  Search,
  AlertTriangle,
  Inbox,
  Bell,
  ShoppingCart,
  Package,
} from 'lucide-react';

export const emptyStateMetadata: ComponentMetadata = {
  id: 'empty-state',
  name: 'EmptyState',
  description: 'Standardized empty state display with icon, title, description, and optional action buttons',
  category: 'feedback',
  variants: ['default', 'search', 'error'],
  preview: (
    <EmptyState
      icon={<FileX className="h-16 w-16" />}
      title="No data available"
      description="There is no data to display at the moment. Try adding some items or adjusting your filters."
      action={{
        label: 'Add Item',
        onClick: () => alert('Add item clicked'),
      }}
    />
  ),
  props: [
    {
      name: 'icon',
      type: 'React.ReactNode',
      description: 'Icon to display above the title',
      required: false,
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title text for the empty state',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text below the title',
      required: false,
    },
    {
      name: 'action',
      type: '{ label: string; onClick: () => void }',
      description: 'Primary action button configuration',
      required: false,
    },
    {
      name: 'secondaryAction',
      type: '{ label: string; onClick: () => void }',
      description: 'Secondary action button configuration',
      required: false,
    },
    {
      name: 'variant',
      type: '"default" | "search" | "error"',
      description: 'Visual variant for different contexts',
      required: false,
      defaultValue: '"default"',
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
      title: 'No Data Available',
      description: 'Default empty state for tables or lists with no data',
      code: `import { EmptyState } from '@/components/empty-state';
import { FileX } from 'lucide-react';

export function NoDataState() {
  return (
    <EmptyState
      icon={<FileX className="h-16 w-16" />}
      title="No data available"
      description="There is no data to display at the moment. Try adding some items or adjusting your filters."
      action={{
        label: 'Add Item',
        onClick: () => console.log('Add item clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          icon={<FileX className="h-16 w-16" />}
          title="No data available"
          description="There is no data to display at the moment. Try adding some items or adjusting your filters."
          action={{
            label: 'Add Item',
            onClick: () => alert('Add item clicked'),
          }}
        />
      ),
    },
    {
      title: 'Search No Results',
      description: 'Empty state when search returns no results',
      code: `import { EmptyState } from '@/components/empty-state';
import { Search } from 'lucide-react';

export function SearchNoResults() {
  return (
    <EmptyState
      variant="search"
      icon={<Search className="h-16 w-16" />}
      title="No results found"
      description="We couldn't find any items matching your search. Try adjusting your search terms or filters."
      action={{
        label: 'Clear Search',
        onClick: () => console.log('Clear search clicked'),
      }}
      secondaryAction={{
        label: 'Reset Filters',
        onClick: () => console.log('Reset filters clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          variant="search"
          icon={<Search className="h-16 w-16" />}
          title="No results found"
          description="We couldn't find any items matching your search. Try adjusting your search terms or filters."
          action={{
            label: 'Clear Search',
            onClick: () => alert('Clear search clicked'),
          }}
          secondaryAction={{
            label: 'Reset Filters',
            onClick: () => alert('Reset filters clicked'),
          }}
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Empty state for error conditions',
      code: `import { EmptyState } from '@/components/empty-state';
import { AlertTriangle } from 'lucide-react';

export function ErrorState() {
  return (
    <EmptyState
      variant="error"
      icon={<AlertTriangle className="h-16 w-16" />}
      title="Something went wrong"
      description="We encountered an error while loading your data. Please try again or contact support if the problem persists."
      action={{
        label: 'Retry',
        onClick: () => console.log('Retry clicked'),
      }}
      secondaryAction={{
        label: 'Contact Support',
        onClick: () => console.log('Contact support clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          variant="error"
          icon={<AlertTriangle className="h-16 w-16" />}
          title="Something went wrong"
          description="We encountered an error while loading your data. Please try again or contact support if the problem persists."
          action={{
            label: 'Retry',
            onClick: () => alert('Retry clicked'),
          }}
          secondaryAction={{
            label: 'Contact Support',
            onClick: () => alert('Contact support clicked'),
          }}
        />
      ),
    },
    {
      title: 'Empty Inbox',
      description: 'Empty state for email or message inbox',
      code: `import { EmptyState } from '@/components/empty-state';
import { Inbox } from 'lucide-react';

export function EmptyInbox() {
  return (
    <EmptyState
      icon={<Inbox className="h-16 w-16" />}
      title="Inbox is empty"
      description="You're all caught up! No new messages at the moment. Enjoy your clear inbox."
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          icon={<Inbox className="h-16 w-16" />}
          title="Inbox is empty"
          description="You're all caught up! No new messages at the moment. Enjoy your clear inbox."
        />
      ),
    },
    {
      title: 'No Notifications',
      description: 'Empty state for notification panel',
      code: `import { EmptyState } from '@/components/empty-state';
import { Bell } from 'lucide-react';

export function NoNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-16 w-16" />}
      title="No notifications"
      description="You don't have any notifications right now. We'll let you know when something important happens."
      action={{
        label: 'View Settings',
        onClick: () => console.log('View settings clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          icon={<Bell className="h-16 w-16" />}
          title="No notifications"
          description="You don't have any notifications right now. We'll let you know when something important happens."
          action={{
            label: 'View Settings',
            onClick: () => alert('View settings clicked'),
          }}
        />
      ),
    },
    {
      title: 'Empty Shopping Cart',
      description: 'Empty state for e-commerce shopping cart',
      code: `import { EmptyState } from '@/components/empty-state';
import { ShoppingCart } from 'lucide-react';

export function EmptyCart() {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-16 w-16" />}
      title="Your cart is empty"
      description="Add some items to your cart to get started. Browse our products and find something you love."
      action={{
        label: 'Continue Shopping',
        onClick: () => console.log('Continue shopping clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          icon={<ShoppingCart className="h-16 w-16" />}
          title="Your cart is empty"
          description="Add some items to your cart to get started. Browse our products and find something you love."
          action={{
            label: 'Continue Shopping',
            onClick: () => alert('Continue shopping clicked'),
          }}
        />
      ),
    },
    {
      title: 'No Orders',
      description: 'Empty state for order history page',
      code: `import { EmptyState } from '@/components/empty-state';
import { Package } from 'lucide-react';

export function NoOrders() {
  return (
    <EmptyState
      icon={<Package className="h-16 w-16" />}
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping to see your order history here."
      action={{
        label: 'Start Shopping',
        onClick: () => console.log('Start shopping clicked'),
      }}
      secondaryAction={{
        label: 'Browse Catalog',
        onClick: () => console.log('Browse catalog clicked'),
      }}
    />
  );
}`,
      language: 'tsx',
      preview: (
        <EmptyState
          icon={<Package className="h-16 w-16" />}
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your order history here."
          action={{
            label: 'Start Shopping',
            onClick: () => alert('Start shopping clicked'),
          }}
          secondaryAction={{
            label: 'Browse Catalog',
            onClick: () => alert('Browse catalog clicked'),
          }}
        />
      ),
    },
  ],
  dependencies: ['react', 'lucide-react'],
  tags: ['empty', 'state', 'placeholder', 'no-data', 'feedback', 'error', 'search', 'inbox'],
};
