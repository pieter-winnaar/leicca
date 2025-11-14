/**
 * MintBlue Theme Definition
 *
 * PRIMARY SOURCE: https://tweakcn.com/themes/cmgj6dc49000t04jv1il0ausg
 *
 * This file contains the complete MintBlue brand theme configuration
 * including colors (oklch format), typography (Work Sans), spacing, and border radius.
 *
 * The theme supports both light and dark mode variants.
 */

import type { Theme, ColorPalette, SidebarColors, ChartColors, Shadows } from '../types/theme.types';

/**
 * Light mode color palette for MintBlue theme
 *
 * All colors are in oklch format for perceptual uniformity.
 * Source: tweakcn theme (link above)
 */
export const mintblueLightColors: ColorPalette = {
  // Primary brand colors (from tweakcn theme - EXACT VALUES)
  primary: 'oklch(0.452 0.313 264.052)',       // #0000FF - pure blue
  primaryForeground: 'oklch(1.0000 0 0)',      // White
  secondary: 'oklch(0.97 0 0)',                // Light gray
  secondaryForeground: 'oklch(0.2345 0.1142 317.0843)',
  accent: 'oklch(0.97 0 0)',                   // Light gray
  accentForeground: 'oklch(0.2345 0.1142 317.0843)',

  // Surface colors (light mode - from tweakcn)
  background: 'oklch(0.9846 0.0017 247.8389)', // #F9FAFB - very light gray
  foreground: 'oklch(0.2345 0.1142 317.0843)', // #320040 - dark purple
  surface: 'oklch(0.9670 0.0029 264.5419)',    // #F3F4F6 - light gray (popover)
  onSurface: 'oklch(0.2345 0.1142 317.0843)',  // #320040 - dark purple

  // Card colors
  card: 'oklch(1.0000 0 0)',                   // White
  cardForeground: 'oklch(0.2345 0.1142 317.0843)',

  // Popover colors
  popover: 'oklch(0.9670 0.0029 264.5419)',
  popoverForeground: 'oklch(0.2345 0.1142 317.0843)',

  // Semantic colors (from tweakcn)
  muted: 'oklch(0.97 0 0)',                    // Light gray
  mutedForeground: 'oklch(0.5560 0 0)',        // Medium gray
  border: 'oklch(0.9220 0 0)',                 // Border gray
  input: 'oklch(0.9220 0 0)',                  // Border gray
  ring: 'oklch(0.7080 0 0)',                   // Ring gray

  // State colors (from tweakcn)
  destructive: 'oklch(0.5770 0.2450 27.3250)', // Red for destructive actions
  destructiveForeground: 'oklch(1 0 0)',       // White text on destructive
};

/**
 * Dark mode color palette for MintBlue theme
 *
 * CORRECT values from tweakcn theme specification.
 * Source: https://tweakcn.com/themes/cmgj6dc49000t04jv1il0ausg
 */
export const mintblueDarkColors: ColorPalette = {
  // Primary colors - Light cyan in dark mode (NOT blue!)
  primary: 'oklch(0.9582 0.0595 184.5549)',           // Light cyan
  primaryForeground: 'oklch(0.2050 0 0)',
  secondary: 'oklch(0.2690 0 0)',
  secondaryForeground: 'oklch(0.9802 0.0272 179.7175)',
  accent: 'oklch(0.3710 0 0)',
  accentForeground: 'oklch(0.9802 0.0272 179.7175)',

  // Surface colors
  background: 'oklch(0.1450 0 0)',
  foreground: 'oklch(0.9802 0.0272 179.7175)',        // Light with cyan tint
  surface: 'oklch(0.2690 0 0)',
  onSurface: 'oklch(0.9802 0.0272 179.7175)',

  // Card colors (dark mode)
  card: 'oklch(0.2050 0 0)',
  cardForeground: 'oklch(0.9802 0.0272 179.7175)',

  // Popover colors (dark mode)
  popover: 'oklch(0.2690 0 0)',
  popoverForeground: 'oklch(0.9802 0.0272 179.7175)',

  // Semantic colors for dark mode
  muted: 'oklch(0.2690 0 0)',
  mutedForeground: 'oklch(0.7080 0 0)',
  border: 'oklch(0.2750 0 0)',
  input: 'oklch(0.3250 0 0)',
  ring: 'oklch(0.5560 0 0)',

  // State colors
  destructive: 'oklch(0.7040 0.1910 22.2160)',
  destructiveForeground: 'oklch(0.9850 0 0)',
};

/**
 * Sidebar colors (light mode)
 */
export const mintblueLightSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.9850 0 0)',
  sidebarForeground: 'oklch(0.1450 0 0)',
  sidebarPrimary: 'oklch(0.2050 0 0)',
  sidebarPrimaryForeground: 'oklch(0.9850 0 0)',
  sidebarAccent: 'oklch(0.9700 0 0)',
  sidebarAccentForeground: 'oklch(0.2050 0 0)',
  sidebarBorder: 'oklch(0.9220 0 0)',
  sidebarRing: 'oklch(0.7080 0 0)',
};

/**
 * Sidebar colors (dark mode)
 *
 * CORRECT values from tweakcn theme specification.
 */
export const mintblueDarkSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.2050 0 0)',
  sidebarForeground: 'oklch(0.9850 0 0)',
  sidebarPrimary: 'oklch(0.4880 0.2430 264.3760)',
  sidebarPrimaryForeground: 'oklch(0.9850 0 0)',
  sidebarAccent: 'oklch(0.2690 0 0)',
  sidebarAccentForeground: 'oklch(0.9850 0 0)',
  sidebarBorder: 'oklch(0.2750 0 0)',
  sidebarRing: 'oklch(0.4390 0 0)',
};

/**
 * Chart colors (light mode)
 */
export const mintblueLightChartColors: ChartColors = {
  chart1: 'oklch(0.4520 0.3132 264.0520)',
  chart2: 'oklch(0.6078 0.2051 278.3851)',
  chart3: 'oklch(0.6750 0.1638 281.0808)',
  chart4: 'oklch(0.7655 0.1236 283.0889)',
  chart5: 'oklch(0.8757 0.0633 285.0194)',
};

/**
 * Chart colors (dark mode)
 *
 * CORRECT values from tweakcn theme specification.
 * Different from light mode!
 */
export const mintblueDarkChartColors: ChartColors = {
  chart1: 'oklch(0.9582 0.0595 184.5549)',
  chart2: 'oklch(0.9502 0.0718 184.1661)',
  chart3: 'oklch(0.9241 0.1136 183.0152)',
  chart4: 'oklch(0.8811 0.1417 180.3919)',
  chart5: 'oklch(0.8944 0.1652 176.9522)',
};

/**
 * Shadow definitions (same for light and dark mode)
 */
export const mintblueShadows: Shadows = {
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
 * Complete MintBlue theme (light mode)
 *
 * This is the default theme for MintBlue brand applications.
 */
export const mintblueTheme: Theme = {
  name: 'mintblue',
  colors: mintblueLightColors,
  sidebarColors: mintblueLightSidebarColors,
  chartColors: mintblueLightChartColors,
  typography: {
    // Font families from tweakcn theme specification
    // Source: https://tweakcn.com/themes/cmgj6dc49000t04jv1il0ausg
    fontFamilies: {
      sans: 'Work Sans, ui-sans-serif, sans-serif, system-ui',
      serif: 'Work Sans, ui-sans-serif, sans-serif, system-ui',
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
    sm: 'calc(0.625rem - 4px)',    // --radius-sm
    md: 'calc(0.625rem - 2px)',    // --radius-md
    lg: '0.625rem',                // --radius (10px)
    xl: 'calc(0.625rem + 4px)',    // --radius-xl
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: mintblueShadows,
  assets: {
    logo: {
      light: '/assets/brands/mintblue/logo-light.svg',
      dark: '/assets/brands/mintblue/logo-dark.svg',
    },
    favicon: '/assets/brands/mintblue/favicon.svg',
  },
};

/**
 * MintBlue theme dark mode variant
 */
export const mintblueThemeDark: Theme = {
  ...mintblueTheme,
  colors: mintblueDarkColors,
  sidebarColors: mintblueDarkSidebarColors,
  chartColors: mintblueDarkChartColors,
};

/**
 * Theme usage documentation
 *
 * Light mode:
 * ```typescript
 * import { mintblueTheme } from '@/themes/mintblue.theme';
 * const theme = mintblueTheme;
 * ```
 *
 * Dark mode:
 * ```typescript
 * import { mintblueThemeDark } from '@/themes/mintblue.theme';
 * const theme = mintblueThemeDark;
 * ```
 *
 * Or use ThemeService to get variants dynamically:
 * ```typescript
 * const themeService = new ThemeService();
 * const lightTheme = themeService.getThemeVariant('mintblue', 'light');
 * const darkTheme = themeService.getThemeVariant('mintblue', 'dark');
 * ```
 */