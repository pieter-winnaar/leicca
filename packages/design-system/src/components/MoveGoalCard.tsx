/**
 * MoveGoalCard Component
 *
 * Interactive dashboard card for setting daily activity goals with visualization
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { AreaChart, AreaChartDataPoint } from './AreaChart';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export interface MoveGoalCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  initialGoal?: number;
  minGoal?: number;
  maxGoal?: number;
  step?: number;
  unit?: string;
  data?: AreaChartDataPoint[];
  dataKey?: string;
  chartHeight?: number;
  onGoalChange?: (goal: number) => void;
  onSetGoal?: (goal: number) => void;
  buttonLabel?: string;
}

/**
 * MoveGoalCard - Interactive card for setting activity goals
 *
 * @example
 * ```tsx
 * const data = [
 *   { day: 'Mon', calories: 280 },
 *   { day: 'Tue', calories: 320 },
 *   { day: 'Wed', calories: 350 },
 * ];
 *
 * <MoveGoalCard
 *   title="Move Goal"
 *   description="Set your daily activity goal"
 *   initialGoal={350}
 *   unit="CALORIES/DAY"
 *   data={data}
 *   onSetGoal={(goal) => console.log('Goal set to:', goal)}
 * />
 * ```
 */
export const MoveGoalCard = React.forwardRef<HTMLDivElement, MoveGoalCardProps>(
  (
    {
      title = 'Move Goal',
      description = 'Set your daily activity goal',
      initialGoal = 350,
      minGoal = 100,
      maxGoal = 1000,
      step = 50,
      unit = 'CALORIES/DAY',
      data,
      dataKey = 'calories',
      chartHeight = 100,
      onGoalChange,
      onSetGoal,
      buttonLabel = 'Set Goal',
      className,
      ...props
    },
    ref
  ) => {
    const [goal, setGoal] = React.useState(initialGoal);

    const handleDecrement = () => {
      const newGoal = Math.max(minGoal, goal - step);
      setGoal(newGoal);
      onGoalChange?.(newGoal);
    };

    const handleIncrement = () => {
      const newGoal = Math.min(maxGoal, goal + step);
      setGoal(newGoal);
      onGoalChange?.(newGoal);
    };

    const handleSetGoal = () => {
      onSetGoal?.(goal);
    };

    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={goal <= minGoal}
              aria-label={`Decrease goal by ${step}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <div className="text-4xl font-bold">{goal}</div>
              <div className="text-sm text-muted-foreground">{unit}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              disabled={goal >= maxGoal}
              aria-label={`Increase goal by ${step}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data && data.length > 0 && (
            <div>
              <AreaChart
                data={data}
                xAxisKey="day"
                areas={[{ dataKey, color: '--chart-1' }]}
                height={chartHeight}
                showGrid={false}
                showLegend={false}
                showXAxis={false}
                showYAxis={false}
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSetGoal}>
            {buttonLabel}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

MoveGoalCard.displayName = 'MoveGoalCard';
