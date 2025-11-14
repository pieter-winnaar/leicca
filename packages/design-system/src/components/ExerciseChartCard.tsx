/**
 * ExerciseChartCard Component
 *
 * Dashboard card with dual-line chart showing actual vs goal metrics
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { LineChart, LineChartDataPoint } from './LineChart';
import { cn } from '../lib/utils';

export interface ExerciseChartCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  data: LineChartDataPoint[];
  xAxisKey?: string;
  actualKey?: string;
  goalKey?: string;
  actualLabel?: string;
  goalLabel?: string;
  chartHeight?: number;
}

/**
 * ExerciseChartCard - Dual-line chart comparing actual vs goal
 *
 * @example
 * ```tsx
 * const data = [
 *   { day: 'Mon', actual: 30, goal: 45 },
 *   { day: 'Tue', actual: 45, goal: 45 },
 *   { day: 'Wed', actual: 50, goal: 45 },
 * ];
 *
 * <ExerciseChartCard
 *   title="Exercise Minutes"
 *   description="Your exercise minutes are ahead of where you normally are"
 *   data={data}
 *   actualKey="actual"
 *   goalKey="goal"
 * />
 * ```
 */
export const ExerciseChartCard = React.forwardRef<HTMLDivElement, ExerciseChartCardProps>(
  (
    {
      title = 'Exercise Minutes',
      description = 'Your exercise minutes are ahead of where you normally are',
      data,
      xAxisKey = 'day',
      actualKey = 'actual',
      goalKey = 'goal',
      actualLabel = 'Actual',
      goalLabel = 'Goal',
      chartHeight = 200,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data}
            xAxisKey={xAxisKey}
            lines={[
              {
                dataKey: actualKey,
                color: '--chart-1',
                name: actualLabel,
              },
              {
                dataKey: goalKey,
                color: '--chart-2',
                name: goalLabel,
                strokeDasharray: '5 5',
              },
            ]}
            height={chartHeight}
            showGrid={true}
            showXAxis={true}
            showYAxis={true}
            showTooltip={true}
            showLegend={false}
          />
        </CardContent>
      </Card>
    );
  }
);

ExerciseChartCard.displayName = 'ExerciseChartCard';
