/**
 * Theme System Type Definitions
 *
 * Defines the structure for themes using oklch color format
 * and comprehensive typography, spacing, and border radius scales.
 */

/**
 * Color palette using oklch format for perceptual uniformity
 */
export interface ColorPalette {
  // Primary brand colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Surface colors
  background: string;
  foreground: string;
  surface: string;
  onSurface: string;

  // Card colors
  card: string;
  cardForeground: string;

  // Popover colors
  popover: string;
  popoverForeground: string;

  // Semantic colors
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;

  // State colors
  destructive: string;
  destructiveForeground: string;
}

/**
 * Sidebar color palette
 */
export interface SidebarColors {
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

/**
 * Chart color palette
 */
export interface ChartColors {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

/**
 * Shadow scale for elevation
 */
export interface Shadows {
  '2xs': string;
  xs: string;
  sm: string;
  default: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Font family variants
 */
export interface FontFamilies {
  sans: string;
  serif: string;
  mono: string;
}

/**
 * Typography scale and font configuration
 */
export interface Typography {
  fontFamilies: FontFamilies;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

/**
 * Spacing scale
 */
export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

/**
 * Border radius values
 */
export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: string;
  colors: ColorPalette;
  sidebarColors: SidebarColors;
  chartColors: ChartColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  assets: {
    logo: {
      light: string;  // Path to logo for light mode
      dark: string;   // Path to logo for dark mode
    };
    favicon: string;  // Path to favicon
  };
}

/**
 * Theme variant type
 */
export type ThemeVariant = 'light' | 'dark';

/**
 * Asset-related types (used by AssetService)
 */
export type ImageSize = 'small' | 'medium' | 'large' | 'original';

export interface AssetPaths {
  logos: string;
  images: string;
  fonts: string;
}
