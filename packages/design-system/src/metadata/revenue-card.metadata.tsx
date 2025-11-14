/**
 * Revenue Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { RevenueCard } from '../components/RevenueCard';
import { TrendingUp } from 'lucide-react';

const sampleData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 4500 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 5500 },
];

export const revenueCardMetadata: ComponentMetadata = {
  id: 'revenue-card',
  name: 'Revenue Card',
  description: 'Dashboard card showing revenue metrics with trend indicator and inline area chart',
  category: 'data-display',
  variants: ['default', 'positive-trend', 'negative-trend'],
  preview: (
    <RevenueCard
      title="Total Revenue"
      value="$15,231.89"
      change={20.1}
      changeLabel="from last month"
      data={sampleData}
      xAxisKey="month"
      valueKey="value"
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Total Revenue',
      description: 'Card title displayed at the top',
      required: false,
    },
    {
      name: 'value',
      type: 'string | number',
      description: 'The main metric value to display (e.g., "$15,231.89")',
      required: true,
    },
    {
      name: 'change',
      type: 'number',
      description: 'Percentage change from previous period (positive or negative)',
      required: true,
    },
    {
      name: 'changeLabel',
      type: 'string',
      defaultValue: 'from last month',
      description: 'Label describing the change period',
      required: false,
    },
    {
      name: 'data',
      type: 'AreaChartDataPoint[]',
      description: 'Array of data points for the inline chart',
      required: true,
    },
    {
      name: 'xAxisKey',
      type: 'string',
      defaultValue: 'month',
      description: 'Key for x-axis data in the data array',
      required: false,
    },
    {
      name: 'valueKey',
      type: 'string',
      defaultValue: 'value',
      description: 'Key for value data in the data array',
      required: false,
    },
    {
      name: 'chartHeight',
      type: 'number',
      defaultValue: '80',
      description: 'Height of the inline chart in pixels',
      required: false,
    },
    {
      name: 'icon',
      type: 'React.ReactNode',
      description: 'Custom icon to display in the header',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Positive Trend',
      description: 'Revenue card with positive growth trend',
      code: `<RevenueCard
  title="Total Revenue"
  value="$15,231.89"
  change={20.1}
  changeLabel="from last month"
  data={data}
  xAxisKey="month"
  valueKey="value"
/>`,
      language: 'tsx',
      preview: (
        <RevenueCard
          title="Total Revenue"
          value="$15,231.89"
          change={20.1}
          changeLabel="from last month"
          data={sampleData}
          xAxisKey="month"
          valueKey="value"
        />
      ),
    },
    {
      title: 'Negative Trend',
      description: 'Revenue card showing declining metrics',
      code: `<RevenueCard
  title="Total Revenue"
  value="$12,450.50"
  change={-8.3}
  changeLabel="from last month"
  data={data}
/>`,
      language: 'tsx',
      preview: (
        <RevenueCard
          title="Total Revenue"
          value="$12,450.50"
          change={-8.3}
          changeLabel="from last month"
          data={sampleData.map(d => ({ ...d, value: d.value * 0.8 }))}
        />
      ),
    },
    {
      title: 'Custom Period',
      description: 'Revenue card with custom time period label',
      code: `<RevenueCard
  title="Annual Revenue"
  value="$180,000"
  change={15.5}
  changeLabel="from last year"
  data={data}
  icon={<TrendingUp className="h-4 w-4" />}
/>`,
      language: 'tsx',
      preview: (
        <RevenueCard
          title="Annual Revenue"
          value="$180,000"
          change={15.5}
          changeLabel="from last year"
          data={sampleData}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts', 'lucide-react'],
  tags: ['revenue', 'metric', 'card', 'chart', 'dashboard', 'analytics'],
};
