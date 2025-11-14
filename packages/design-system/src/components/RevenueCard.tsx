/**
 * RevenueCard Component
 *
 * Reusable dashboard card showing revenue metrics with trend and inline chart
 */

import * as React from 'react';
import { Card, CardHeader, CardContent } from './card';
import { AreaChart, AreaChartDataPoint } from './AreaChart';
import { TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface RevenueCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  data: AreaChartDataPoint[];
  xAxisKey?: string;
  valueKey?: string;
  chartHeight?: number;
  icon?: React.ReactNode;
}

/**
 * RevenueCard - Dashboard card with metric, trend, and inline area chart
 *
 * @example
 * ```tsx
 * const data = [
 *   { month: 'Jan', revenue: 4000 },
 *   { month: 'Feb', revenue: 3000 },
 *   { month: 'Mar', revenue: 5000 },
 * ];
 *
 * <RevenueCard
 *   title="Total Revenue"
 *   value="$15,231.89"
 *   change={20.1}
 *   changeLabel="from last month"
 *   data={data}
 *   xAxisKey="month"
 *   valueKey="revenue"
 * />
 * ```
 */
export const RevenueCard = React.forwardRef<HTMLDivElement, RevenueCardProps>(
  (
    {
      title = 'Total Revenue',
      value,
      change,
      changeLabel = 'from last month',
      data,
      xAxisKey = 'month',
      valueKey = 'value',
      chartHeight = 80,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card ref={ref} className={cn(className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium">{title}</span>
          {icon || <TrendingUp className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span
              className={cn(
                change >= 0 ? 'text-foreground' : 'text-destructive'
              )}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
            {changeLabel}
          </p>
          <div className="mt-4">
            <AreaChart
              data={data}
              xAxisKey={xAxisKey}
              areas={[{ dataKey: valueKey, color: '--chart-1' }]}
              height={chartHeight}
              showGrid={false}
              showLegend={false}
              showXAxis={false}
              showYAxis={false}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

RevenueCard.displayName = 'RevenueCard';
