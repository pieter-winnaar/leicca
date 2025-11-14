/**
 * Theme Constants (Server-Safe)
 *
 * This file contains theme definitions extracted from the design system
 * in a way that's safe to import in server components.
 *
 * These are used in the blocking script to prevent theme flash.
 */

import type { Theme } from '@design-system-demo/design-system';

// D2 Legal Tech Light Theme
export const d2legaltechLightTheme = {
  name: 'd2legaltech',
  displayName: 'D2 Legal Technology',
  variant: 'light',
  colors: {
    primary: 'oklch(0.2845 0.0842 251.8976)',
    primaryForeground: 'oklch(1.0000 0 0)',
    secondary: 'oklch(0.9670 0.0050 264.5419)',
    secondaryForeground: 'oklch(0.2845 0.0842 251.8976)',
    accent: 'oklch(0.7850 0.1124 205.8976)',
    accentForeground: 'oklch(0.2845 0.0842 251.8976)',
    background: 'oklch(1.0000 0 0)',
    foreground: 'oklch(0.2845 0.0842 251.8976)',
    surface: 'oklch(0.9750 0.0025 264.5419)',
    onSurface: 'oklch(0.2845 0.0842 251.8976)',
    card: 'oklch(1.0000 0 0)',
    cardForeground: 'oklch(0.2845 0.0842 251.8976)',
    popover: 'oklch(1.0000 0 0)',
    popoverForeground: 'oklch(0.2845 0.0842 251.8976)',
    muted: 'oklch(0.9750 0.0025 264.5419)',
    mutedForeground: 'oklch(0.5600 0.0200 251.8976)',
    destructive: 'oklch(0.5500 0.2200 17.3800)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.9200 0.0050 264.5419)',
    input: 'oklch(0.9200 0.0050 264.5419)',
    ring: 'oklch(0.2845 0.0842 251.8976)',
    success: 'oklch(0.6000 0.1500 142.5000)',
    warning: 'oklch(0.7000 0.1800 85.8700)',
    info: 'oklch(0.6000 0.1500 240.0000)',
  },
  sidebarColors: {
    sidebarBackground: 'oklch(0.2845 0.0842 251.8976)',
    sidebarForeground: 'oklch(1.0000 0 0)',
    sidebarPrimary: 'oklch(0.7850 0.1124 205.8976)',
    sidebarPrimaryForeground: 'oklch(0.2845 0.0842 251.8976)',
    sidebarAccent: 'oklch(0.3845 0.0842 251.8976)',
    sidebarAccentForeground: 'oklch(1.0000 0 0)',
    sidebarBorder: 'oklch(0.3845 0.0842 251.8976)',
    sidebarRing: 'oklch(0.7850 0.1124 205.8976)',
  },
  chartColors: {
    chart1: 'oklch(0.2845 0.0842 251.8976)',
    chart2: 'oklch(0.7850 0.1124 205.8976)',
    chart3: 'oklch(0.6500 0.1300 140.0000)',
    chart4: 'oklch(0.7000 0.1800 85.8700)',
    chart5: 'oklch(0.6000 0.1500 320.0000)',
  },
  typography: {
    fontFamilies: {
      sans: '"Open Sans", "Futura PT", ui-sans-serif, system-ui, sans-serif',
      serif: 'Baskerville, Georgia, "Times New Roman", serif',
      mono: 'ui-monospace, "Courier New", monospace',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
  },
  assets: {
    logo: {
      light: '/assets/brands/d2legaltech/logo-light.svg',
      dark: '/assets/brands/d2legaltech/logo-dark.svg',
    },
    favicon: '/assets/brands/d2legaltech/favicon.png',
  },
};

// D2 Legal Tech Dark Theme
export const d2legaltechDarkTheme = {
  name: 'd2legaltech',
  displayName: 'D2 Legal Technology',
  variant: 'dark',
  colors: {
    primary: 'oklch(0.7850 0.1124 205.8976)',
    primaryForeground: 'oklch(0.2845 0.0842 251.8976)',
    secondary: 'oklch(0.2500 0.0300 251.8976)',
    secondaryForeground: 'oklch(0.9500 0.0100 264.5419)',
    accent: 'oklch(0.2845 0.0842 251.8976)',
    accentForeground: 'oklch(0.7850 0.1124 205.8976)',
    background: 'oklch(0.1800 0.0500 251.8976)',
    foreground: 'oklch(0.9500 0.0100 264.5419)',
    surface: 'oklch(0.2200 0.0400 251.8976)',
    onSurface: 'oklch(0.9500 0.0100 264.5419)',
    card: 'oklch(0.2200 0.0400 251.8976)',
    cardForeground: 'oklch(0.9500 0.0100 264.5419)',
    popover: 'oklch(0.2200 0.0400 251.8976)',
    popoverForeground: 'oklch(0.9500 0.0100 264.5419)',
    muted: 'oklch(0.2500 0.0300 251.8976)',
    mutedForeground: 'oklch(0.7000 0.0200 264.5419)',
    destructive: 'oklch(0.5500 0.2200 17.3800)',
    destructiveForeground: 'oklch(1.0000 0 0)',
    border: 'oklch(0.3000 0.0400 251.8976)',
    input: 'oklch(0.3000 0.0400 251.8976)',
    ring: 'oklch(0.7850 0.1124 205.8976)',
    success: 'oklch(0.6000 0.1500 142.5000)',
    warning: 'oklch(0.7000 0.1800 85.8700)',
    info: 'oklch(0.6000 0.1500 240.0000)',
  },
  sidebarColors: {
    sidebarBackground: 'oklch(0.1500 0.0600 251.8976)',
    sidebarForeground: 'oklch(0.9500 0.0100 264.5419)',
    sidebarPrimary: 'oklch(0.7850 0.1124 205.8976)',
    sidebarPrimaryForeground: 'oklch(0.1500 0.0600 251.8976)',
    sidebarAccent: 'oklch(0.2500 0.0500 251.8976)',
    sidebarAccentForeground: 'oklch(0.9500 0.0100 264.5419)',
    sidebarBorder: 'oklch(0.2500 0.0500 251.8976)',
    sidebarRing: 'oklch(0.7850 0.1124 205.8976)',
  },
  chartColors: {
    chart1: 'oklch(0.7850 0.1124 205.8976)',
    chart2: 'oklch(0.2845 0.0842 251.8976)',
    chart3: 'oklch(0.6500 0.1300 140.0000)',
    chart4: 'oklch(0.7000 0.1800 85.8700)',
    chart5: 'oklch(0.6000 0.1500 320.0000)',
  },
  typography: {
    fontFamilies: {
      sans: '"Open Sans", "Futura PT", ui-sans-serif, system-ui, sans-serif',
      serif: 'Baskerville, Georgia, "Times New Roman", serif',
      mono: 'ui-monospace, "Courier New", monospace',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '1rem',
  },
  assets: {
    logo: {
      light: '/assets/brands/d2legaltech/logo-light.svg',
      dark: '/assets/brands/d2legaltech/logo-dark.svg',
    },
    favicon: '/assets/brands/d2legaltech/favicon.png',
  },
};

// Export themes object for inline script
export const themes = {
  d2legaltech: {
    light: d2legaltechLightTheme,
    dark: d2legaltechDarkTheme,
  },
};
