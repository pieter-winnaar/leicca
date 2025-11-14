/**
 * Bar Chart Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { BarChart } from '../components/BarChart';

const sampleData = [
  { day: 'Mon', calories: 280 },
  { day: 'Tue', calories: 320 },
  { day: 'Wed', calories: 350 },
  { day: 'Thu', calories: 290 },
  { day: 'Fri', calories: 370 },
  { day: 'Sat', calories: 310 },
  { day: 'Sun', calories: 400 },
];

export const barChartMetadata: ComponentMetadata = {
  id: 'bar-chart',
  name: 'Bar Chart',
  description: 'Responsive bar chart component built on recharts with theme integration',
  category: 'data-display',
  variants: ['default', 'stacked', 'grouped'],
  preview: (
    <BarChart
      data={sampleData}
      xAxisKey="day"
      bars={[{ dataKey: 'calories', color: '--chart-1', name: 'Calories' }]}
      height={250}
    />
  ),
  props: [
    {
      name: 'data',
      type: 'BarChartDataPoint[]',
      description: 'Array of data points to display in the chart',
      required: true,
    },
    {
      name: 'xAxisKey',
      type: 'string',
      description: 'Key for x-axis values in the data array',
      required: true,
    },
    {
      name: 'bars',
      type: 'BarChartConfig[]',
      description: 'Configuration array for each bar series',
      required: true,
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: '350',
      description: 'Height of the chart in pixels',
      required: false,
    },
    {
      name: 'showGrid',
      type: 'boolean',
      defaultValue: 'true',
      description: 'Whether to display the grid lines',
      required: false,
    },
    {
      name: 'showTooltip',
      type: 'boolean',
      defaultValue: 'true',
      description: 'Whether to show tooltips on hover',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Basic Bar Chart',
      description: 'Simple bar chart showing calorie data',
      code: `<BarChart
  data={data}
  xAxisKey="day"
  bars={[{ dataKey: 'calories', color: '--chart-1', name: 'Calories' }]}
  height={250}
/>`,
      language: 'tsx',
      preview: (
        <BarChart
          data={sampleData}
          xAxisKey="day"
          bars={[{ dataKey: 'calories', color: '--chart-1', name: 'Calories' }]}
          height={250}
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts'],
  tags: ['chart', 'bar', 'graph', 'data-visualization', 'analytics'],
};
