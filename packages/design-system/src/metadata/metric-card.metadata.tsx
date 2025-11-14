import type { ComponentMetadata } from '../types/component.types';
import { MetricCard } from '../components/MetricCard';
import { DollarSign, Users, Activity } from 'lucide-react';

export const metricCardMetadata: ComponentMetadata = {
  id: 'metric-card',
  name: 'MetricCard',
  description: 'Card component for displaying metrics with trend indicators',
  category: 'data-display',
  variants: ['default', 'success', 'warning', 'danger'],
  preview: (
    <div className="space-y-4">
      <MetricCard
        title="Total Revenue"
        value="$1,250.00"
        trend={{ value: 12.5, direction: 'up' }}
        description="from last month"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Title of the metric',
      required: true,
    },
    {
      name: 'value',
      type: 'string | number',
      description: 'The metric value to display',
      required: true,
    },
    {
      name: 'trend',
      type: '{ value: number; direction: "up" | "down" | "neutral" }',
      description: 'Trend indicator with percentage and direction',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Additional description text',
      required: false,
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description: 'Icon to display in the card',
      required: false,
    },
    {
      name: 'variant',
      type: '"default" | "success" | "warning" | "danger"',
      description: 'Visual variant of the card',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Metric with Upward Trend',
      description: 'Display a metric with positive trend',
      code: `<MetricCard
  title="Total Revenue"
  value="$1,250.00"
  trend={{ value: 12.5, direction: 'up' }}
  description="from last month"
  icon={<DollarSign className="h-4 w-4" />}
/>`,
      language: 'tsx',
      preview: (
        <MetricCard
          title="Total Revenue"
          value="$1,250.00"
          trend={{ value: 12.5, direction: 'up' }}
          description="from last month"
          icon={<DollarSign className="h-4 w-4" />}
        />
      ),
    },
    {
      title: 'Metric with Downward Trend',
      description: 'Display a metric with negative trend and warning variant',
      code: `<MetricCard
  title="New Customers"
  value="1,234"
  trend={{ value: -20, direction: 'down' }}
  description="from last month"
  icon={<Users className="h-4 w-4" />}
  variant="warning"
/>`,
      language: 'tsx',
      preview: (
        <MetricCard
          title="New Customers"
          value="1,234"
          trend={{ value: -20, direction: 'down' }}
          description="from last month"
          icon={<Users className="h-4 w-4" />}
          variant="warning"
        />
      ),
    },
    {
      title: 'Success Variant',
      description: 'Metric card with success styling',
      code: `<MetricCard
  title="Active Accounts"
  value="45,678"
  trend={{ value: 12.5, direction: 'up' }}
  description="from last month"
  icon={<Activity className="h-4 w-4" />}
  variant="success"
/>`,
      language: 'tsx',
      preview: (
        <MetricCard
          title="Active Accounts"
          value="45,678"
          trend={{ value: 12.5, direction: 'up' }}
          description="from last month"
          icon={<Activity className="h-4 w-4" />}
          variant="success"
        />
      ),
    },
  ],
  dependencies: ['react', 'lucide-react', 'class-variance-authority'],
  tags: ['metric', 'card', 'stats', 'analytics', 'dashboard', 'kpi'],
};
