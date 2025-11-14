/**
 * ING Bank Theme Definition
 *
 * Official ING brand theme featuring their signature orange color (#FF6200)
 * and professional banking design aesthetic.
 *
 * Brand Guidelines: ING uses a clean, approachable design with their
 * distinctive orange as the primary brand color. The design emphasizes
 * clarity, trust, and accessibility.
 *
 * Fonts: ING Me (proprietary) with system font fallbacks
 * Primary Color: ING Orange #FF6200
 */

import type { Theme, ColorPalette, SidebarColors, ChartColors, Shadows } from '../types/theme.types';

/**
 * Light mode color palette for ING theme
 *
 * All colors are in oklch format for perceptual uniformity.
 * Primary brand color: ING Orange #FF6200
 */
export const ingLightColors: ColorPalette = {
  // Primary brand colors - ING Orange
  primary: 'oklch(0.6724 0.1951 42.9956)',       // #FF6200 - ING Orange
  primaryForeground: 'oklch(1.0000 0 0)',        // White
  secondary: 'oklch(0.9670 0.0050 264.5419)',    // Light gray #F5F5F5
  secondaryForeground: 'oklch(0.2450 0.0050 264.5419)', // Dark gray #333333
  accent: 'oklch(0.9670 0.0050 264.5419)',       // Light gray
  accentForeground: 'oklch(0.2450 0.0050 264.5419)',    // Dark gray

  // Surface colors (light mode)
  background: 'oklch(1.0000 0 0)',               // Pure white
  foreground: 'oklch(0.2450 0.0050 264.5419)',   // Dark gray #333333
  surface: 'oklch(0.9850 0.0025 264.5419)',      // Off-white
  onSurface: 'oklch(0.2450 0.0050 264.5419)',    // Dark gray

  // Card colors
  card: 'oklch(1.0000 0 0)',                     // White
  cardForeground: 'oklch(0.2450 0.0050 264.5419)',

  // Popover colors
  popover: 'oklch(1.0000 0 0)',                  // White
  popoverForeground: 'oklch(0.2450 0.0050 264.5419)',

  // Semantic colors
  muted: 'oklch(0.9670 0.0050 264.5419)',        // Light gray
  mutedForeground: 'oklch(0.5560 0.0050 264.5419)', // Medium gray #767676
  border: 'oklch(0.9220 0.0050 264.5419)',       // Border gray #E0E0E0
  input: 'oklch(0.9220 0.0050 264.5419)',        // Border gray
  ring: 'oklch(0.6724 0.1951 42.9956)',          // ING Orange (focus)

  // State colors
  destructive: 'oklch(0.5305 0.1946 27.3250)',   // Red #D32F2F
  destructiveForeground: 'oklch(1.0000 0 0)',    // White
};

/**
 * Dark mode color palette for ING theme
 *
 * Adjusted for dark backgrounds while maintaining ING brand identity
 */
export const ingDarkColors: ColorPalette = {
  // Primary colors - Brighter orange for dark mode
  primary: 'oklch(0.7240 0.1951 42.9956)',           // Brighter ING Orange
  primaryForeground: 'oklch(0.1450 0.0050 264.5419)', // Dark background
  secondary: 'oklch(0.2450 0.0050 264.5419)',        // Dark gray
  secondaryForeground: 'oklch(0.9670 0.0050 264.5419)', // Light gray
  accent: 'oklch(0.3250 0.0050 264.5419)',           // Slightly lighter dark
  accentForeground: 'oklch(0.9670 0.0050 264.5419)',

  // Surface colors (dark mode)
  background: 'oklch(0.1450 0.0050 264.5419)',   // Dark background #1A1A1A
  foreground: 'oklch(0.9670 0.0050 264.5419)',   // Light text
  surface: 'oklch(0.2050 0.0050 264.5419)',      // Slightly lighter surface
  onSurface: 'oklch(0.9670 0.0050 264.5419)',

  // Card colors (dark mode)
  card: 'oklch(0.2050 0.0050 264.5419)',         // Dark card
  cardForeground: 'oklch(0.9670 0.0050 264.5419)',

  // Popover colors (dark mode)
  popover: 'oklch(0.2450 0.0050 264.5419)',
  popoverForeground: 'oklch(0.9670 0.0050 264.5419)',

  // Semantic colors (dark mode)
  muted: 'oklch(0.2750 0.0050 264.5419)',
  mutedForeground: 'oklch(0.7080 0.0050 264.5419)',
  border: 'oklch(0.3250 0.0050 264.5419)',
  input: 'oklch(0.3750 0.0050 264.5419)',
  ring: 'oklch(0.7240 0.1951 42.9956)',          // Brighter orange

  // State colors (dark mode)
  destructive: 'oklch(0.6305 0.1946 27.3250)',   // Lighter red
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Sidebar colors (light mode)
 */
export const ingLightSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.9850 0.0025 264.5419)',      // Off-white
  sidebarForeground: 'oklch(0.2450 0.0050 264.5419)', // Dark gray
  sidebarPrimary: 'oklch(0.6724 0.1951 42.9956)', // ING Orange
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)', // White
  sidebarAccent: 'oklch(0.9670 0.0050 264.5419)', // Light gray
  sidebarAccentForeground: 'oklch(0.2450 0.0050 264.5419)',
  sidebarBorder: 'oklch(0.9220 0.0050 264.5419)',
  sidebarRing: 'oklch(0.6724 0.1951 42.9956)',   // ING Orange
};

/**
 * Sidebar colors (dark mode)
 */
export const ingDarkSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.1850 0.0050 264.5419)',      // Darker sidebar
  sidebarForeground: 'oklch(0.9670 0.0050 264.5419)',
  sidebarPrimary: 'oklch(0.7240 0.1951 42.9956)', // Bright orange
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
  sidebarAccent: 'oklch(0.2750 0.0050 264.5419)',
  sidebarAccentForeground: 'oklch(0.9670 0.0050 264.5419)',
  sidebarBorder: 'oklch(0.3250 0.0050 264.5419)',
  sidebarRing: 'oklch(0.7240 0.1951 42.9956)',
};

/**
 * Chart colors (light mode)
 * Accessible color palette for data visualization
 */
export const ingLightChartColors: ChartColors = {
  chart1: 'oklch(0.6724 0.1951 42.9956)',        // ING Orange
  chart2: 'oklch(0.5290 0.1368 253.4890)',       // Blue
  chart3: 'oklch(0.6290 0.1425 152.0855)',       // Green
  chart4: 'oklch(0.6724 0.1530 55.4568)',        // Amber
  chart5: 'oklch(0.5305 0.1368 295.4890)',       // Purple
};

/**
 * Chart colors (dark mode)
 * Brighter variations for dark backgrounds
 */
export const ingDarkChartColors: ChartColors = {
  chart1: 'oklch(0.7240 0.1951 42.9956)',        // Brighter orange
  chart2: 'oklch(0.6290 0.1368 253.4890)',       // Brighter blue
  chart3: 'oklch(0.7290 0.1425 152.0855)',       // Brighter green
  chart4: 'oklch(0.7724 0.1530 55.4568)',        // Brighter amber
  chart5: 'oklch(0.6805 0.1368 295.4890)',       // Brighter purple
};

/**
 * Shadow definitions (same for light and dark mode)
 * Subtle shadows for professional banking aesthetic
 */
export const ingShadows: Shadows = {
  '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  xs: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  sm: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 6px 12px -2px rgba(0, 0, 0, 0.08)',
  lg: '0 10px 20px -5px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

/**
 * Complete ING theme (light mode)
 *
 * This is the default theme for ING Bank brand applications.
 */
export const ingTheme: Theme = {
  name: 'ing',
  colors: ingLightColors,
  sidebarColors: ingLightSidebarColors,
  chartColors: ingLightChartColors,
  typography: {
    // ING Me is the official ING Bank font (loaded via @font-face in globals.css)
    // Font files should be placed in: public/assets/brands/ing/fonts/
    fontFamilies: {
      sans: '"ING Me", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, "Times New Roman", Times, serif',
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
    sm: '0.25rem',    // 4px - subtle, professional
    md: '0.5rem',     // 8px - cards, containers
    lg: '0.5rem',     // 8px - same as md for consistency
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',   // circular (avatars, badges)
  },
  shadows: ingShadows,
  assets: {
    logo: {
      light: '/assets/brands/ing/logo-light.svg',
      dark: '/assets/brands/ing/logo-dark.svg',
    },
    favicon: '/assets/brands/ing/favicon.svg',
  },
};

/**
 * ING theme dark mode variant
 */
export const ingThemeDark: Theme = {
  ...ingTheme,
  colors: ingDarkColors,
  sidebarColors: ingDarkSidebarColors,
  chartColors: ingDarkChartColors,
};

/**
 * Theme usage documentation
 *
 * Light mode:
 * ```typescript
 * import { ingTheme } from '@/themes/ing.theme';
 * const theme = ingTheme;
 * ```
 *
 * Dark mode:
 * ```typescript
 * import { ingThemeDark } from '@/themes/ing.theme';
 * const theme = ingThemeDark;
 * ```
 *
 * Or use ThemeService to get variants dynamically:
 * ```typescript
 * const themeService = new ThemeService();
 * const lightTheme = themeService.getThemeVariant('ing', 'light');
 * const darkTheme = themeService.getThemeVariant('ing', 'dark');
 * ```
 */
