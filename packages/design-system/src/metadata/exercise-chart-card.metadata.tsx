/**
 * Exercise Chart Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { ExerciseChartCard } from '../components/ExerciseChartCard';

const sampleData = [
  { day: 'Mon', actual: 30, goal: 45 },
  { day: 'Tue', actual: 45, goal: 45 },
  { day: 'Wed', actual: 50, goal: 45 },
  { day: 'Thu', actual: 40, goal: 45 },
  { day: 'Fri', actual: 55, goal: 45 },
  { day: 'Sat', actual: 35, goal: 45 },
  { day: 'Sun', actual: 60, goal: 45 },
];

export const exerciseChartCardMetadata: ComponentMetadata = {
  id: 'exercise-chart-card',
  name: 'Exercise Chart Card',
  description: 'Dashboard card with dual-line chart comparing actual vs goal metrics',
  category: 'data-display',
  variants: ['default'],
  preview: (
    <ExerciseChartCard
      title="Exercise Minutes"
      description="Your exercise minutes are ahead of where you normally are"
      data={sampleData}
      actualKey="actual"
      goalKey="goal"
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Exercise Minutes',
      description: 'Card title',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      description: 'Card description text',
      required: false,
    },
    {
      name: 'data',
      type: 'LineChartDataPoint[]',
      description: 'Array of data points with actual and goal values',
      required: true,
    },
    {
      name: 'xAxisKey',
      type: 'string',
      defaultValue: 'day',
      description: 'Key for x-axis data',
      required: false,
    },
    {
      name: 'actualKey',
      type: 'string',
      defaultValue: 'actual',
      description: 'Key for actual values in data',
      required: false,
    },
    {
      name: 'goalKey',
      type: 'string',
      defaultValue: 'goal',
      description: 'Key for goal values in data',
      required: false,
    },
    {
      name: 'chartHeight',
      type: 'number',
      defaultValue: '200',
      description: 'Height of the chart in pixels',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Exercise Tracking',
      description: 'Chart showing exercise progress vs goal',
      code: `<ExerciseChartCard
  title="Exercise Minutes"
  description="Your exercise minutes are ahead of where you normally are"
  data={data}
  actualKey="actual"
  goalKey="goal"
/>`,
      language: 'tsx',
      preview: (
        <ExerciseChartCard
          title="Exercise Minutes"
          description="Your exercise minutes are ahead of where you normally are"
          data={sampleData}
          actualKey="actual"
          goalKey="goal"
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts'],
  tags: ['chart', 'exercise', 'fitness', 'card', 'metrics', 'dashboard'],
};
