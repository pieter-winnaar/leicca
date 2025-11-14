import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent } from './card';

const metricCardVariants = cva('', {
  variants: {
    variant: {
      default: 'border-border',
      success: 'border-border',
      warning: 'border-border',
      danger: 'border-destructive/20 bg-destructive/5',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const trendVariants = cva('inline-flex items-center gap-1 text-xs font-medium', {
  variants: {
    trend: {
      up: 'text-foreground',
      down: 'text-destructive',
      neutral: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    trend: 'neutral',
  },
});

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  description?: string;
  icon?: React.ReactNode;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      variant,
      title,
      value,
      trend,
      description,
      icon,
      ...props
    },
    ref
  ) => {
    const getTrendIcon = () => {
      if (!trend) return null;
      if (trend.direction === 'up') {
        return <TrendingUp className="h-3 w-3" />;
      }
      if (trend.direction === 'down') {
        return <TrendingDown className="h-3 w-3" />;
      }
      return null;
    };

    const formatTrendValue = (value: number) => {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value}%`;
    };

    return (
      <Card
        ref={ref}
        className={cn(metricCardVariants({ variant }), className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </div>
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {icon}
              </div>
            )}
          </div>
          {(trend || description) && (
            <div className="mt-4 flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    trendVariants({ trend: trend.direction })
                  )}
                >
                  {getTrendIcon()}
                  {formatTrendValue(trend.value)}
                </span>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export { MetricCard, metricCardVariants };
