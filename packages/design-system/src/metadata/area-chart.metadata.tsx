import type { ComponentMetadata } from '../types/component.types';
import { AreaChart } from '../components/AreaChart';

const sampleData = [
  { month: 'Jan', visitors: 4000, sales: 2400 },
  { month: 'Feb', visitors: 3000, sales: 1398 },
  { month: 'Mar', visitors: 2000, sales: 9800 },
  { month: 'Apr', visitors: 2780, sales: 3908 },
  { month: 'May', visitors: 1890, sales: 4800 },
  { month: 'Jun', visitors: 2390, sales: 3800 },
  { month: 'Jul', visitors: 3490, sales: 4300 },
];

export const areaChartMetadata: ComponentMetadata = {
  id: 'area-chart',
  name: 'AreaChart',
  description: 'Theme-aware area chart component built with Recharts',
  category: 'data-display',
  variants: ['default'],
  preview: (
    <AreaChart
      data={sampleData}
      xAxisKey="month"
      areas={[
        { dataKey: 'visitors', name: 'Visitors', color: '--chart-1' },
      ]}
      height={300}
    />
  ),
  props: [
    {
      name: 'data',
      type: 'AreaChartDataPoint[]',
      description: 'Array of data points to display',
      required: true,
    },
    {
      name: 'xAxisKey',
      type: 'string',
      description: 'Key in data objects to use for X-axis',
      required: true,
    },
    {
      name: 'areas',
      type: 'AreaChartConfig[]',
      description: 'Configuration for each area series (dataKey, color, name)',
      required: true,
    },
    {
      name: 'height',
      type: 'number',
      description: 'Height of the chart in pixels',
      required: false,
    },
    {
      name: 'showGrid',
      type: 'boolean',
      description: 'Whether to show grid lines',
      required: false,
    },
    {
      name: 'showTooltip',
      type: 'boolean',
      description: 'Whether to show tooltip on hover',
      required: false,
    },
    {
      name: 'showLegend',
      type: 'boolean',
      description: 'Whether to show legend',
      required: false,
    },
    {
      name: 'showXAxis',
      type: 'boolean',
      description: 'Whether to show X-axis',
      required: false,
    },
    {
      name: 'showYAxis',
      type: 'boolean',
      description: 'Whether to show Y-axis',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Single Area Chart',
      description: 'Simple area chart with one data series',
      code: `const data = [
  { month: 'Jan', visitors: 4000 },
  { month: 'Feb', visitors: 3000 },
  { month: 'Mar', visitors: 2000 },
  { month: 'Apr', visitors: 2780 },
  { month: 'May', visitors: 1890 },
  { month: 'Jun', visitors: 2390 },
];

<AreaChart
  data={data}
  xAxisKey="month"
  areas={[
    { dataKey: 'visitors', name: 'Visitors', color: '--chart-1' },
  ]}
  height={300}
/>`,
      language: 'tsx',
      preview: (
        <AreaChart
          data={sampleData}
          xAxisKey="month"
          areas={[
            { dataKey: 'visitors', name: 'Visitors', color: '--chart-1' },
          ]}
          height={300}
        />
      ),
    },
    {
      title: 'Multiple Area Series',
      description: 'Area chart with multiple data series',
      code: `const data = [
  { month: 'Jan', visitors: 4000, sales: 2400 },
  { month: 'Feb', visitors: 3000, sales: 1398 },
  { month: 'Mar', visitors: 2000, sales: 9800 },
  { month: 'Apr', visitors: 2780, sales: 3908 },
  { month: 'May', visitors: 1890, sales: 4800 },
  { month: 'Jun', visitors: 2390, sales: 3800 },
];

<AreaChart
  data={data}
  xAxisKey="month"
  areas={[
    { dataKey: 'visitors', name: 'Visitors', color: '--chart-1' },
    { dataKey: 'sales', name: 'Sales', color: '--chart-2' },
  ]}
  height={300}
/>`,
      language: 'tsx',
      preview: (
        <AreaChart
          data={sampleData}
          xAxisKey="month"
          areas={[
            { dataKey: 'visitors', name: 'Visitors', color: '--chart-1' },
            { dataKey: 'sales', name: 'Sales', color: '--chart-2' },
          ]}
          height={300}
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts'],
  tags: ['chart', 'area-chart', 'graph', 'visualization', 'analytics', 'data'],
};
