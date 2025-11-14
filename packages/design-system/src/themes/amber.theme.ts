/**
 * Amber Minimal Theme Definition
 *
 * A warm, minimal theme featuring amber/orange tones
 * Supports both light and dark mode variants
 *
 * Fonts:
 * - Sans: Inter
 * - Serif: Source Serif 4
 * - Mono: JetBrains Mono
 */

import type { Theme, ColorPalette, SidebarColors, ChartColors, Shadows } from '../types/theme.types';

/**
 * Light mode color palette for Amber Minimal theme
 */
export const amberLightColors: ColorPalette = {
  // Primary colors
  primary: 'oklch(0.7686 0.1647 70.0804)',
  primaryForeground: 'oklch(0 0 0)',
  secondary: 'oklch(0.9670 0.0029 264.5419)',
  secondaryForeground: 'oklch(0.4461 0.0263 256.8018)',
  accent: 'oklch(0.9869 0.0214 95.2774)',
  accentForeground: 'oklch(0.4732 0.1247 46.2007)',

  // Surface colors (light mode)
  background: 'oklch(1.0000 0 0)',
  foreground: 'oklch(0.2686 0 0)',
  surface: 'oklch(1.0000 0 0)',
  onSurface: 'oklch(0.2686 0 0)',

  // Card colors
  card: 'oklch(1.0000 0 0)',
  cardForeground: 'oklch(0.2686 0 0)',

  // Popover colors
  popover: 'oklch(1.0000 0 0)',
  popoverForeground: 'oklch(0.2686 0 0)',

  // Semantic colors
  muted: 'oklch(0.9846 0.0017 247.8389)',
  mutedForeground: 'oklch(0.5510 0.0234 264.3637)',
  border: 'oklch(0.9276 0.0058 264.5313)',
  input: 'oklch(0.9276 0.0058 264.5313)',
  ring: 'oklch(0.7686 0.1647 70.0804)',

  // State colors
  destructive: 'oklch(0.6368 0.2078 25.3313)',
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Dark mode color palette for Amber Minimal theme
 */
export const amberDarkColors: ColorPalette = {
  // Primary colors
  primary: 'oklch(0.7686 0.1647 70.0804)',
  primaryForeground: 'oklch(0 0 0)',
  secondary: 'oklch(0.2686 0 0)',
  secondaryForeground: 'oklch(0.9219 0 0)',
  accent: 'oklch(0.4732 0.1247 46.2007)',
  accentForeground: 'oklch(0.9243 0.1151 95.7459)',

  // Surface colors (dark mode)
  background: 'oklch(0.2046 0 0)',
  foreground: 'oklch(0.9219 0 0)',
  surface: 'oklch(0.2686 0 0)',
  onSurface: 'oklch(0.9219 0 0)',

  // Card colors
  card: 'oklch(0.2686 0 0)',
  cardForeground: 'oklch(0.9219 0 0)',

  // Popover colors
  popover: 'oklch(0.2686 0 0)',
  popoverForeground: 'oklch(0.9219 0 0)',

  // Semantic colors
  muted: 'oklch(0.2393 0 0)',
  mutedForeground: 'oklch(0.7155 0 0)',
  border: 'oklch(0.3715 0 0)',
  input: 'oklch(0.3715 0 0)',
  ring: 'oklch(0.7686 0.1647 70.0804)',

  // State colors
  destructive: 'oklch(0.6368 0.2078 25.3313)',
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Sidebar colors (light mode)
 */
export const amberLightSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.9846 0.0017 247.8389)',
  sidebarForeground: 'oklch(0.2686 0 0)',
  sidebarPrimary: 'oklch(0.7686 0.1647 70.0804)',
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
  sidebarAccent: 'oklch(0.9869 0.0214 95.2774)',
  sidebarAccentForeground: 'oklch(0.4732 0.1247 46.2007)',
  sidebarBorder: 'oklch(0.9276 0.0058 264.5313)',
  sidebarRing: 'oklch(0.7686 0.1647 70.0804)',
};

/**
 * Sidebar colors (dark mode)
 */
export const amberDarkSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.1684 0 0)',
  sidebarForeground: 'oklch(0.9219 0 0)',
  sidebarPrimary: 'oklch(0.7686 0.1647 70.0804)',
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
  sidebarAccent: 'oklch(0.4732 0.1247 46.2007)',
  sidebarAccentForeground: 'oklch(0.9243 0.1151 95.7459)',
  sidebarBorder: 'oklch(0.3715 0 0)',
  sidebarRing: 'oklch(0.7686 0.1647 70.0804)',
};

/**
 * Chart colors (light mode)
 */
export const amberLightChartColors: ChartColors = {
  chart1: 'oklch(0.7686 0.1647 70.0804)',
  chart2: 'oklch(0.6658 0.1574 58.3183)',
  chart3: 'oklch(0.5553 0.1455 48.9975)',
  chart4: 'oklch(0.4732 0.1247 46.2007)',
  chart5: 'oklch(0.4137 0.1054 45.9038)',
};

/**
 * Chart colors (dark mode)
 */
export const amberDarkChartColors: ChartColors = {
  chart1: 'oklch(0.8369 0.1644 84.4286)',
  chart2: 'oklch(0.6658 0.1574 58.3183)',
  chart3: 'oklch(0.4732 0.1247 46.2007)',
  chart4: 'oklch(0.5553 0.1455 48.9975)',
  chart5: 'oklch(0.4732 0.1247 46.2007)',
};

/**
 * Shadow definitions (same for light and dark mode)
 */
export const amberShadows: Shadows = {
  '2xs': '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
  xs: '0px 4px 8px -1px hsl(0 0% 0% / 0.05)',
  sm: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
  default: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 1px 2px -2px hsl(0 0% 0% / 0.10)',
  md: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 2px 4px -2px hsl(0 0% 0% / 0.10)',
  lg: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 4px 6px -2px hsl(0 0% 0% / 0.10)',
  xl: '0px 4px 8px -1px hsl(0 0% 0% / 0.10), 0px 8px 10px -2px hsl(0 0% 0% / 0.10)',
  '2xl': '0px 4px 8px -1px hsl(0 0% 0% / 0.25)',
};

/**
 * Complete Amber Minimal theme (light mode)
 */
export const amberTheme: Theme = {
  name: 'amber',
  colors: amberLightColors,
  sidebarColors: amberLightSidebarColors,
  chartColors: amberLightChartColors,
  typography: {
    fontFamilies: {
      sans: 'Inter, sans-serif',
      serif: 'Source Serif 4, serif',
      mono: 'JetBrains Mono, monospace',
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
    sm: 'calc(0.375rem - 4px)',    // --radius-sm
    md: 'calc(0.375rem - 2px)',    // --radius-md
    lg: '0.375rem',                // --radius (6px)
    xl: 'calc(0.375rem + 4px)',    // --radius-xl
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: amberShadows,
  assets: {
    logo: {
      light: '/assets/brands/amber/logo-light.svg',
      dark: '/assets/brands/amber/logo-dark.svg',
    },
    favicon: '/assets/brands/amber/favicon.svg',
  },
};

/**
 * Amber Minimal theme dark mode variant
 */
export const amberThemeDark: Theme = {
  ...amberTheme,
  colors: amberDarkColors,
  sidebarColors: amberDarkSidebarColors,
  chartColors: amberDarkChartColors,
};
