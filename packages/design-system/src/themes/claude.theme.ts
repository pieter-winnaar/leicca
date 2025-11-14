/**
 * Claude Theme Definition
 *
 * A warm, professional theme featuring Claude's signature orange tones
 * Specially designed for Claude Code with excellent accessibility
 * Supports both light and dark mode variants
 *
 * Fonts:
 * - Sans: System UI stack (ui-sans-serif, system-ui, etc.)
 * - Serif: System serif stack
 * - Mono: System monospace stack
 */

import type { Theme, ColorPalette, SidebarColors, ChartColors, Shadows } from '../types/theme.types';

/**
 * Light mode color palette for Claude theme
 */
export const claudeLightColors: ColorPalette = {
  // Primary colors - Claude's signature orange
  primary: 'oklch(0.6171 0.1375 39.0427)',
  primaryForeground: 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.9245 0.0138 92.9892)',
  secondaryForeground: 'oklch(0.4334 0.0177 98.6048)',
  accent: 'oklch(0.9245 0.0138 92.9892)',
  accentForeground: 'oklch(0.2671 0.0196 98.9390)',

  // Surface colors (light mode)
  background: 'oklch(0.9818 0.0054 95.0986)',
  foreground: 'oklch(0.3438 0.0269 95.7226)',
  surface: 'oklch(0.9818 0.0054 95.0986)',
  onSurface: 'oklch(0.3438 0.0269 95.7226)',

  // Card colors
  card: 'oklch(0.9818 0.0054 95.0986)',
  cardForeground: 'oklch(0.1908 0.0020 106.5859)',

  // Popover colors
  popover: 'oklch(1.0000 0 0)',
  popoverForeground: 'oklch(0.2671 0.0196 98.9390)',

  // Semantic colors
  muted: 'oklch(0.9341 0.0153 90.2390)',
  mutedForeground: 'oklch(0.6059 0.0075 97.4233)',
  border: 'oklch(0.8847 0.0069 97.3627)',
  input: 'oklch(0.7621 0.0156 98.3528)',
  ring: 'oklch(0.6171 0.1375 39.0427)',

  // State colors
  destructive: 'oklch(0.1908 0.0020 106.5859)',
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Dark mode color palette for Claude theme
 */
export const claudeDarkColors: ColorPalette = {
  // Primary colors - Claude's signature orange (brighter in dark mode)
  primary: 'oklch(0.6724 0.1308 38.7559)',
  primaryForeground: 'oklch(1.0000 0 0)',
  secondary: 'oklch(0.9818 0.0054 95.0986)',
  secondaryForeground: 'oklch(0.3085 0.0035 106.6039)',
  accent: 'oklch(0.2130 0.0078 95.4245)',
  accentForeground: 'oklch(0.9663 0.0080 98.8792)',

  // Surface colors (dark mode)
  background: 'oklch(0.2679 0.0036 106.6427)',
  foreground: 'oklch(0.8074 0.0142 93.0137)',
  surface: 'oklch(0.3085 0.0035 106.6039)',
  onSurface: 'oklch(0.8074 0.0142 93.0137)',

  // Card colors
  card: 'oklch(0.2679 0.0036 106.6427)',
  cardForeground: 'oklch(0.9818 0.0054 95.0986)',

  // Popover colors
  popover: 'oklch(0.3085 0.0035 106.6039)',
  popoverForeground: 'oklch(0.9211 0.0040 106.4781)',

  // Semantic colors
  muted: 'oklch(0.2213 0.0038 106.7070)',
  mutedForeground: 'oklch(0.7713 0.0169 99.0657)',
  border: 'oklch(0.3618 0.0101 106.8928)',
  input: 'oklch(0.4336 0.0113 100.2195)',
  ring: 'oklch(0.6724 0.1308 38.7559)',

  // State colors
  destructive: 'oklch(0.6368 0.2078 25.3313)',
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Sidebar colors (light mode)
 */
export const claudeLightSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.9663 0.0080 98.8792)',
  sidebarForeground: 'oklch(0.3590 0.0051 106.6524)',
  sidebarPrimary: 'oklch(0.6171 0.1375 39.0427)',
  sidebarPrimaryForeground: 'oklch(0.9881 0 0)',
  sidebarAccent: 'oklch(0.9245 0.0138 92.9892)',
  sidebarAccentForeground: 'oklch(0.3250 0 0)',
  sidebarBorder: 'oklch(0.9401 0 0)',
  sidebarRing: 'oklch(0.7731 0 0)',
};

/**
 * Sidebar colors (dark mode)
 */
export const claudeDarkSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.2357 0.0024 67.7077)',
  sidebarForeground: 'oklch(0.8074 0.0142 93.0137)',
  sidebarPrimary: 'oklch(0.3250 0 0)',
  sidebarPrimaryForeground: 'oklch(0.9881 0 0)',
  sidebarAccent: 'oklch(0.1680 0.0020 106.6177)',
  sidebarAccentForeground: 'oklch(0.8074 0.0142 93.0137)',
  sidebarBorder: 'oklch(0.9401 0 0)',
  sidebarRing: 'oklch(0.7731 0 0)',
};

/**
 * Chart colors (light mode)
 */
export const claudeLightChartColors: ChartColors = {
  chart1: 'oklch(0.5583 0.1276 42.9956)',
  chart2: 'oklch(0.6898 0.1581 290.4107)',
  chart3: 'oklch(0.8816 0.0276 93.1280)',
  chart4: 'oklch(0.8822 0.0403 298.1792)',
  chart5: 'oklch(0.5608 0.1348 42.0584)',
};

/**
 * Chart colors (dark mode)
 */
export const claudeDarkChartColors: ChartColors = {
  chart1: 'oklch(0.5583 0.1276 42.9956)',
  chart2: 'oklch(0.6898 0.1581 290.4107)',
  chart3: 'oklch(0.2130 0.0078 95.4245)',
  chart4: 'oklch(0.3074 0.0516 289.3230)',
  chart5: 'oklch(0.5608 0.1348 42.0584)',
};

/**
 * Shadow definitions (same for light and dark mode)
 */
export const claudeShadows: Shadows = {
  '2xs': '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
  xs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
  sm: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
  default: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)',
  md: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)',
  lg: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)',
  xl: '0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)',
  '2xl': '0 1px 3px 0px hsl(0 0% 0% / 0.25)',
};

/**
 * Complete Claude theme (light mode)
 */
export const claudeTheme: Theme = {
  name: 'claude',
  colors: claudeLightColors,
  sidebarColors: claudeLightSidebarColors,
  chartColors: claudeLightChartColors,
  typography: {
    fontFamilies: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  borderRadius: {
    none: '0',
    sm: 'calc(0.5rem - 4px)',    // --radius-sm
    md: 'calc(0.5rem - 2px)',    // --radius-md
    lg: '0.5rem',                // --radius (8px)
    xl: 'calc(0.5rem + 4px)',    // --radius-xl
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: claudeShadows,
  assets: {
    logo: {
      light: '/assets/brands/claude/logo-light.svg',
      dark: '/assets/brands/claude/logo-dark.svg',
    },
    favicon: '/assets/brands/claude/favicon.svg',
  },
};

/**
 * Claude theme dark mode variant
 */
export const claudeThemeDark: Theme = {
  ...claudeTheme,
  colors: claudeDarkColors,
  sidebarColors: claudeDarkSidebarColors,
  chartColors: claudeDarkChartColors,
};
