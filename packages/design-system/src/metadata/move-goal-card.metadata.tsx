/**
 * Move Goal Card Component Metadata
 */

import { ComponentMetadata } from '../types/component.types';
import { MoveGoalCard } from '../components/MoveGoalCard';

const sampleData = [
  { day: 'Mon', calories: 280 },
  { day: 'Tue', calories: 320 },
  { day: 'Wed', calories: 350 },
  { day: 'Thu', calories: 290 },
  { day: 'Fri', calories: 370 },
  { day: 'Sat', calories: 310 },
  { day: 'Sun', calories: 400 },
];

export const moveGoalCardMetadata: ComponentMetadata = {
  id: 'move-goal-card',
  name: 'Move Goal Card',
  description: 'Interactive dashboard card for setting daily activity goals with visualization and controls',
  category: 'data-display',
  variants: ['default', 'calories', 'steps'],
  preview: (
    <MoveGoalCard
      title="Move Goal"
      description="Set your daily activity goal"
      initialGoal={350}
      unit="CALORIES/DAY"
      data={sampleData}
    />
  ),
  props: [
    {
      name: 'title',
      type: 'string',
      defaultValue: 'Move Goal',
      description: 'Card title displayed at the top',
      required: false,
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Set your daily activity goal',
      description: 'Card description displayed below the title',
      required: false,
    },
    {
      name: 'initialGoal',
      type: 'number',
      defaultValue: '350',
      description: 'Initial goal value',
      required: false,
    },
    {
      name: 'minGoal',
      type: 'number',
      defaultValue: '100',
      description: 'Minimum allowed goal value',
      required: false,
    },
    {
      name: 'maxGoal',
      type: 'number',
      defaultValue: '1000',
      description: 'Maximum allowed goal value',
      required: false,
    },
    {
      name: 'step',
      type: 'number',
      defaultValue: '50',
      description: 'Increment/decrement step value',
      required: false,
    },
    {
      name: 'unit',
      type: 'string',
      defaultValue: 'CALORIES/DAY',
      description: 'Unit label displayed below the goal value',
      required: false,
    },
    {
      name: 'data',
      type: 'AreaChartDataPoint[]',
      description: 'Array of data points for the visualization chart',
      required: false,
    },
    {
      name: 'dataKey',
      type: 'string',
      defaultValue: 'calories',
      description: 'Key for the data values in the chart',
      required: false,
    },
    {
      name: 'chartHeight',
      type: 'number',
      defaultValue: '100',
      description: 'Height of the chart in pixels',
      required: false,
    },
    {
      name: 'onGoalChange',
      type: '(goal: number) => void',
      description: 'Callback fired when goal value changes via +/- buttons',
      required: false,
    },
    {
      name: 'onSetGoal',
      type: '(goal: number) => void',
      description: 'Callback fired when "Set Goal" button is clicked',
      required: false,
    },
    {
      name: 'buttonLabel',
      type: 'string',
      defaultValue: 'Set Goal',
      description: 'Label for the action button',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Calories Goal',
      description: 'Set daily calorie burn goal with visualization',
      code: `<MoveGoalCard
  title="Move Goal"
  description="Set your daily activity goal"
  initialGoal={350}
  unit="CALORIES/DAY"
  data={data}
  onSetGoal={(goal) => console.log('Goal set to:', goal)}
/>`,
      language: 'tsx',
      preview: (
        <MoveGoalCard
          title="Move Goal"
          description="Set your daily activity goal"
          initialGoal={350}
          unit="CALORIES/DAY"
          data={sampleData}
        />
      ),
    },
    {
      title: 'Steps Goal',
      description: 'Set daily steps target with larger increments',
      code: `<MoveGoalCard
  title="Steps Goal"
  description="Set your daily steps target"
  initialGoal={10000}
  minGoal={1000}
  maxGoal={30000}
  step={1000}
  unit="STEPS/DAY"
  data={stepsData}
/>`,
      language: 'tsx',
      preview: (
        <MoveGoalCard
          title="Steps Goal"
          description="Set your daily steps target"
          initialGoal={10000}
          minGoal={1000}
          maxGoal={30000}
          step={1000}
          unit="STEPS/DAY"
          data={sampleData.map(d => ({ day: d.day, steps: d.calories * 30 }))}
          dataKey="steps"
        />
      ),
    },
    {
      title: 'Without Chart',
      description: 'Goal setting card without visualization',
      code: `<MoveGoalCard
  title="Move Goal"
  description="Set your daily activity goal"
  initialGoal={350}
  unit="CALORIES/DAY"
/>`,
      language: 'tsx',
      preview: (
        <MoveGoalCard
          title="Move Goal"
          description="Set your daily activity goal"
          initialGoal={350}
          unit="CALORIES/DAY"
        />
      ),
    },
  ],
  dependencies: ['react', 'recharts', 'lucide-react'],
  tags: ['goal', 'activity', 'interactive', 'card', 'dashboard', 'fitness'],
};
