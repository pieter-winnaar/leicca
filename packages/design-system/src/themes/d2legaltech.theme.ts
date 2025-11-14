/**
 * D2 Legal Technology Theme Definition
 *
 * Professional legal tech theme featuring D2LT's signature navy blue and turquoise
 * Brand source: https://d2legaltech.com/
 *
 * D2 Legal Technology is an award-winning legal data consulting firm acting as
 * a trusted advisor to institutions on process, data and the use of technology.
 *
 * Primary Colors:
 * - Navy Blue #16305A: Trust, professionalism, legal expertise
 * - Turquoise #62C8E6: Modern, tech-forward, innovation
 *
 * Fonts:
 * - Sans: Futura PT (headlines), Open Sans (body text)
 * - Serif: Baskerville (quotes, emphasis)
 * - Mono: System monospace stack
 */

import type { Theme, ColorPalette, SidebarColors, ChartColors, Shadows } from '../types/theme.types';

/**
 * Light mode color palette for D2 Legal Tech theme
 *
 * All colors converted to oklch format for perceptual uniformity.
 * Source colors from https://d2legaltech.com/ CSS
 */
export const d2legaltechLightColors: ColorPalette = {
  // Primary brand colors - Navy blue and turquoise
  primary: 'oklch(0.2845 0.0842 251.8976)',       // #16305A - Navy blue (PROMINENT)
  primaryForeground: 'oklch(1.0000 0 0)',          // White
  secondary: 'oklch(0.9670 0.0050 264.5419)',      // #F9F9F9 - Light gray
  secondaryForeground: 'oklch(0.2845 0.0842 251.8976)', // NAVY for text (was gray)
  accent: 'oklch(0.7850 0.1124 205.8976)',         // #62C8E6 - Turquoise accent
  accentForeground: 'oklch(0.2845 0.0842 251.8976)', // Navy blue on turquoise

  // Surface colors (light mode) - Navy-forward design
  background: 'oklch(1.0000 0 0)',                 // #FFFFFF - Pure white
  foreground: 'oklch(0.2845 0.0842 251.8976)',     // NAVY text (was gray) - PROMINENT
  surface: 'oklch(0.9750 0.0025 264.5419)',        // #F9F9F9 - Near-white
  onSurface: 'oklch(0.2845 0.0842 251.8976)',      // NAVY (was gray) - PROMINENT

  // Card colors - Navy text for prominence
  card: 'oklch(1.0000 0 0)',                       // White
  cardForeground: 'oklch(0.2845 0.0842 251.8976)', // NAVY (was gray) - PROMINENT

  // Popover colors - Navy text
  popover: 'oklch(1.0000 0 0)',                    // White
  popoverForeground: 'oklch(0.2845 0.0842 251.8976)', // NAVY (was gray) - PROMINENT

  // Semantic colors
  muted: 'oklch(0.9550 0.0050 264.5419)',          // #F2F2F2 - Off-white
  mutedForeground: 'oklch(0.4950 0.0050 264.5419)', // #868686 - Medium-light gray
  border: 'oklch(0.9050 0.0050 264.5419)',         // #DCDCDC - Light gray border
  input: 'oklch(0.9550 0.0050 264.5419)',          // #EFEFEF - Off-white
  ring: 'oklch(0.2845 0.0842 251.8976)',           // Navy blue focus ring (consistent with primary)

  // State colors
  destructive: 'oklch(0.4850 0.1946 25.3313)',     // #D2232A - Red
  destructiveForeground: 'oklch(1.0000 0 0)',      // White
};

/**
 * Dark mode color palette for D2 Legal Tech theme
 *
 * Adjusted for dark backgrounds while maintaining brand identity
 * Navy blue becomes lighter, turquoise remains vibrant
 */
export const d2legaltechDarkColors: ColorPalette = {
  // Primary colors - Brighter for dark mode
  primary: 'oklch(0.8050 0.1124 205.8976)',           // Bright turquoise
  primaryForeground: 'oklch(0.1450 0.0050 264.5419)', // Very dark background
  secondary: 'oklch(0.2050 0.0050 264.5419)',         // Dark surface
  secondaryForeground: 'oklch(0.8850 0.0100 264.5419)', // Light gray text
  accent: 'oklch(0.4845 0.0842 251.8976)',            // Lighter navy
  accentForeground: 'oklch(0.9850 0.0050 264.5419)',  // Near-white

  // Surface colors (dark mode)
  background: 'oklch(0.1450 0.0050 264.5419)',    // #171717 - Dark gray
  foreground: 'oklch(0.8850 0.0100 264.5419)',    // Light gray text
  surface: 'oklch(0.1850 0.0050 264.5419)',       // #2A2C2F - Charcoal
  onSurface: 'oklch(0.8850 0.0100 264.5419)',

  // Card colors (dark mode)
  card: 'oklch(0.2050 0.0050 264.5419)',          // Dark card
  cardForeground: 'oklch(0.8850 0.0100 264.5419)',

  // Popover colors (dark mode)
  popover: 'oklch(0.2250 0.0050 264.5419)',
  popoverForeground: 'oklch(0.8850 0.0100 264.5419)',

  // Semantic colors (dark mode)
  muted: 'oklch(0.2450 0.0050 264.5419)',
  mutedForeground: 'oklch(0.6450 0.0100 264.5419)', // #B2B2B2 - Light gray
  border: 'oklch(0.3250 0.0050 264.5419)',
  input: 'oklch(0.3750 0.0050 264.5419)',
  ring: 'oklch(0.8050 0.1124 205.8976)',           // Bright turquoise (accent for visibility in dark mode)

  // State colors (dark mode)
  destructive: 'oklch(0.6050 0.1946 25.3313)',     // Lighter red
  destructiveForeground: 'oklch(1.0000 0 0)',
};

/**
 * Sidebar colors (light mode)
 */
export const d2legaltechLightSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.9850 0.0025 264.5419)',        // Off-white
  sidebarForeground: 'oklch(0.3845 0.0100 264.5419)', // Medium gray
  sidebarPrimary: 'oklch(0.2845 0.0842 251.8976)', // Navy blue
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)',   // White
  sidebarAccent: 'oklch(0.9670 0.0050 264.5419)',  // Light gray
  sidebarAccentForeground: 'oklch(0.3845 0.0100 264.5419)',
  sidebarBorder: 'oklch(0.9050 0.0050 264.5419)',
  sidebarRing: 'oklch(0.7850 0.1124 205.8976)',    // Turquoise
};

/**
 * Sidebar colors (dark mode)
 */
export const d2legaltechDarkSidebarColors: SidebarColors = {
  sidebar: 'oklch(0.1650 0.0050 264.5419)',        // Darker sidebar
  sidebarForeground: 'oklch(0.8850 0.0100 264.5419)',
  sidebarPrimary: 'oklch(0.8050 0.1124 205.8976)', // Bright turquoise
  sidebarPrimaryForeground: 'oklch(1.0000 0 0)',
  sidebarAccent: 'oklch(0.2450 0.0050 264.5419)',
  sidebarAccentForeground: 'oklch(0.8850 0.0100 264.5419)',
  sidebarBorder: 'oklch(0.3250 0.0050 264.5419)',
  sidebarRing: 'oklch(0.8050 0.1124 205.8976)',
};

/**
 * Chart colors (light mode)
 * Professional legal tech palette: navy, turquoise, grays
 */
export const d2legaltechLightChartColors: ChartColors = {
  chart1: 'oklch(0.2845 0.0842 251.8976)',        // Navy blue
  chart2: 'oklch(0.7850 0.1124 205.8976)',        // Turquoise
  chart3: 'oklch(0.5345 0.0842 251.8976)',        // Medium blue
  chart4: 'oklch(0.6550 0.1124 205.8976)',        // Medium turquoise
  chart5: 'oklch(0.4950 0.0050 264.5419)',        // Medium gray
};

/**
 * Chart colors (dark mode)
 * Brighter variations for dark backgrounds
 */
export const d2legaltechDarkChartColors: ChartColors = {
  chart1: 'oklch(0.8050 0.1124 205.8976)',        // Bright turquoise
  chart2: 'oklch(0.5345 0.0842 251.8976)',        // Medium navy
  chart3: 'oklch(0.6550 0.1124 205.8976)',        // Medium turquoise
  chart4: 'oklch(0.7850 0.0842 251.8976)',        // Light navy
  chart5: 'oklch(0.7450 0.0100 264.5419)',        // Light gray
};

/**
 * Shadow definitions (same for light and dark mode)
 * Subtle shadows for professional legal aesthetic
 */
export const d2legaltechShadows: Shadows = {
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
 * Complete D2 Legal Tech theme (light mode)
 *
 * This is the default theme for D2 Legal Technology brand applications.
 */
export const d2legaltechTheme: Theme = {
  name: 'd2legaltech',
  colors: d2legaltechLightColors,
  sidebarColors: d2legaltechLightSidebarColors,
  chartColors: d2legaltechLightChartColors,
  typography: {
    // Primary fonts from D2LT website
    // Futura PT for headlines, Open Sans for body text, Baskerville for serif
    fontFamilies: {
      sans: '"Futura PT", "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Baskerville, "Goudy Old Style", Palatino, "Book Antiqua", Georgia, serif',
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
    sm: '0.25rem',    // 4px - professional, subtle
    md: '0.375rem',   // 6px - cards, containers
    lg: '0.5rem',     // 8px - prominent elements
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',   // circular (avatars, badges)
  },
  shadows: d2legaltechShadows,
  assets: {
    logo: {
      light: '/assets/brands/d2legaltech/logo-light.svg',
      dark: '/assets/brands/d2legaltech/logo-dark.svg',
    },
    favicon: '/assets/brands/d2legaltech/favicon.png',
  },
};

/**
 * D2 Legal Tech theme dark mode variant
 */
export const d2legaltechThemeDark: Theme = {
  ...d2legaltechTheme,
  colors: d2legaltechDarkColors,
  sidebarColors: d2legaltechDarkSidebarColors,
  chartColors: d2legaltechDarkChartColors,
};

/**
 * Theme usage documentation
 *
 * Light mode:
 * ```typescript
 * import { d2legaltechTheme } from '@/themes/d2legaltech.theme';
 * const theme = d2legaltechTheme;
 * ```
 *
 * Dark mode:
 * ```typescript
 * import { d2legaltechThemeDark } from '@/themes/d2legaltech.theme';
 * const theme = d2legaltechThemeDark;
 * ```
 *
 * Or use ThemeService to get variants dynamically:
 * ```typescript
 * const themeService = new ThemeService();
 * const lightTheme = themeService.getThemeVariant('d2legaltech', 'light');
 * const darkTheme = themeService.getThemeVariant('d2legaltech', 'dark');
 * ```
 */
