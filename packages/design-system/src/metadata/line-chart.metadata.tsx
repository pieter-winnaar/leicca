/**
 * Line Chart Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { LineChart } from '../components/LineChart';

const sampleData = [
  { day: 'Mon', actual: 30, goal: 45 },
  { day: 'Tue', actual: 45, goal: 45 },
  { day: 'Wed', actual: 50, goal: 45 },
  { day: 'Thu', actual: 40, goal: 45 },
  { day: 'Fri', actual: 55, goal: 45 },
  { day: 'Sat', actual: 35, goal: 45 },
  { day: 'Sun', actual: 60, goal: 45 },
];

export const lineChartMetadata: ComponentMetadata = {
  id: 'line-chart',
  name: 'Line Chart',
  description: 'Responsive line chart component built on recharts with theme integration',
  category: 'data-display',
  variants: ['single-line', 'multi-line', 'dashed-line'],
  preview: (
    <LineChart
      data={sampleData}
      xAxisKey="day"
      lines={[
        { dataKey: 'actual', color: '--chart-1', name: 'Actual' },
        { dataKey: 'goal', color: '--chart-2', name: 'Goal', strokeDasharray: '5 5' },
      ]}
      height={250}
    />
  ),
  props: [
    {
      name: 'data',
      type: 'LineChartDataPoint[]',
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
      name: 'lines',
      type: 'LineChartConfig[]',
      description: 'Configuration array for each line series',
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
    {
      name: 'lineType',
      type: "'monotone' | 'linear' | 'natural' | 'step'",
      defaultValue: 'monotone',
      description: 'Type of line interpolation',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Dual Line Chart',
      description: 'Chart with two lines comparing actual vs goal',
      code: `<LineChart
  data={data}
  xAxisKey="day"
  lines={[
    { dataKey: 'actual', color: '--chart-1', name: 'Actual' },
    { dataKey: 'goal', color: '--chart-2', name: 'Goal', strokeDasharray: '5 5' },
  ]}
  height={250}
/>`,
      language: 'tsx',
      preview: (
        <LineChart
          data={sampleData}
          xAxisKey="day"
          lines={[
            { dataKey: 'actual', color: '--chart-1', name: 'Actual' },
            { dataKey: 'goal', color: '--chart-2', name: 'Goal', strokeDasharray: '5 5' },
          ]}
          height={250}
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts'],
  tags: ['chart', 'line', 'graph', 'data-visualization', 'analytics'],
};
