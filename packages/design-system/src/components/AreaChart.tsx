'use client';

import * as React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

export interface AreaChartDataPoint {
  [key: string]: string | number;
}

export interface AreaChartConfig {
  dataKey: string;
  color?: string;
  name?: string;
}

export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: AreaChartDataPoint[];
  xAxisKey: string;
  areas: AreaChartConfig[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((entry: any, index: number) => (
              <span key={index} className="font-bold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(
  (
    {
      className,
      data,
      xAxisKey,
      areas,
      height = 350,
      showGrid = true,
      showTooltip = true,
      showLegend = true,
      showXAxis = true,
      showYAxis = true,
      ...props
    },
    ref
  ) => {
    // Watch for theme changes to trigger re-render
    const { theme } = useTheme();

    // Get computed CSS variable values for theme colors
    // Recharts needs actual color values, not CSS variable references
    // This function is called on each render, so it picks up theme changes
    const getColor = React.useCallback((colorKey?: string, fallbackIndex?: number): string => {
      if (typeof window === 'undefined') return '#000'; // SSR fallback

      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      if (!colorKey) {
        if (fallbackIndex !== undefined) {
          const value = computedStyle.getPropertyValue(`--chart-${fallbackIndex}`).trim();
          return value ? `oklch(${value})` : '#000';
        }
        const value = computedStyle.getPropertyValue('--primary').trim();
        return value ? `oklch(${value})` : '#000';
      }

      // If it's a CSS variable reference
      if (colorKey.startsWith('--')) {
        const value = computedStyle.getPropertyValue(colorKey).trim();
        return value ? `oklch(${value})` : '#000';
      }

      // If it's already a color value
      return colorKey;
    }, [theme]); // Re-compute colors when theme changes

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsAreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
            )}
            {showXAxis && (
              <XAxis
                dataKey={xAxisKey}
                stroke={getColor('--muted-foreground')}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
            )}
            {showYAxis && (
              <YAxis
                stroke={getColor('--muted-foreground')}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
                iconType="circle"
              />
            )}
            {areas.map((areaConfig, index) => (
              <Area
                key={areaConfig.dataKey}
                type="monotone"
                dataKey={areaConfig.dataKey}
                name={areaConfig.name || areaConfig.dataKey}
                stroke={getColor(areaConfig.color, index + 1)}
                fill={getColor(areaConfig.color, index + 1)}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

AreaChart.displayName = 'AreaChart';

export { AreaChart };
