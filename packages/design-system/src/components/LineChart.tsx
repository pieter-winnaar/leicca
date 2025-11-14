'use client';

import * as React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

export interface LineChartDataPoint {
  [key: string]: string | number;
}

export interface LineChartConfig {
  dataKey: string;
  color?: string;
  name?: string;
  strokeDasharray?: string;
}

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: LineChartDataPoint[];
  xAxisKey: string;
  lines: LineChartConfig[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  lineType?: 'monotone' | 'linear' | 'natural' | 'step';
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

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      className,
      data,
      xAxisKey,
      lines,
      height = 350,
      showGrid = true,
      showTooltip = true,
      showLegend = true,
      showXAxis = true,
      showYAxis = true,
      lineType = 'monotone',
      ...props
    },
    ref
  ) => {
    // Watch for theme changes to trigger re-render
    const { theme } = useTheme();

    // Get computed CSS variable values for theme colors
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
    }, [theme]);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
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
            {lines.map((lineConfig, index) => (
              <Line
                key={lineConfig.dataKey}
                type={lineType}
                dataKey={lineConfig.dataKey}
                name={lineConfig.name || lineConfig.dataKey}
                stroke={getColor(lineConfig.color, index + 1)}
                strokeWidth={2}
                strokeDasharray={lineConfig.strokeDasharray}
                dot={{ fill: getColor(lineConfig.color, index + 1), r: 3 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

LineChart.displayName = 'LineChart';

export { LineChart };
