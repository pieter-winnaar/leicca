'use client';

/**
 * ThemeProvider
 *
 * LOCATION: packages/design-system/src/components/ThemeProvider.tsx
 *
 * Provides theme context to shadcn/ui components
 * Manages light/dark mode switching with localStorage persistence (via next-themes)
 * Dynamically injects CSS variables from ThemeService based on themeName prop
 * Supports multi-brand theme switching
 *
 * FOUC FIX: Uses next-themes for flash-free light/dark switching
 *
 * Usage:
 * ```tsx
 * <ThemeProvider defaultTheme="light" themeName="mintblue">
 *   <App />
 * </ThemeProvider>
 * ```
 */

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import type { Theme, ThemeVariant } from '../types/theme.types';
import { ThemeService } from '../services/ThemeService';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeVariant;
  themeName?: string;
  storageKey?: string;
}

export interface ThemeConfig {
  variant?: ThemeVariant;
  name?: string;
}

interface ThemeProviderState {
  theme: ThemeVariant;
  themeName: string;
  assets?: Theme['assets'];
  setTheme: (config: ThemeConfig) => void;
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
);

/**
 * Internal component that uses next-themes hook
 * This must be inside NextThemesProvider
 */
function ThemeProviderInner({
  children,
  themeName: initialThemeName = 'mintblue',
  storageKey = 'ui-theme',
}: Omit<ThemeProviderProps, 'defaultTheme'>) {
  // Use next-themes for light/dark (flash-free)
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const theme = (nextTheme as ThemeVariant) || 'light';

  const [themeName, setThemeNameState] = React.useState<string>(initialThemeName);
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [mounted, setMounted] = React.useState(false);

  // Load theme name from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    const storedThemeName = localStorage.getItem(`${storageKey}-name`);
    if (storedThemeName) {
      setThemeNameState(storedThemeName);
    }
  }, [storageKey]);

  // Apply theme changes - inject CSS variables and update favicon
  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Persist theme name to localStorage
    localStorage.setItem(`${storageKey}-name`, themeName);

    // Inject CSS variables dynamically (for theme switching)
    const themeService = new ThemeService();
    const themeData = themeService.getThemeVariant(themeName, theme);
    setCurrentTheme(themeData);

    // Colors
    Object.entries(themeData.colors).forEach(([key, value]) => {
      const strippedValue = value.replace(/^oklch\((.*)\)$/, '$1');
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, strippedValue);
    });

    // Sidebar colors
    Object.entries(themeData.sidebarColors).forEach(([key, value]) => {
      const strippedValue = value.replace(/^oklch\((.*)\)$/, '$1');
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, strippedValue);
    });

    // Chart colors - convert chart1 -> chart-1, chart2 -> chart-2, etc.
    Object.entries(themeData.chartColors).forEach(([key, value]) => {
      const strippedValue = value.replace(/^oklch\((.*)\)$/, '$1');
      // Convert chart1 -> chart-1, chart2 -> chart-2, etc.
      const cssKey = key.replace(/^chart(\d)$/, 'chart-$1');
      root.style.setProperty(`--${cssKey}`, strippedValue);
    });

    // Fonts
    root.style.setProperty('--font-sans', themeData.typography.fontFamilies.sans);
    root.style.setProperty('--font-serif', themeData.typography.fontFamilies.serif);
    root.style.setProperty('--font-mono', themeData.typography.fontFamilies.mono);

    // Radius
    root.style.setProperty('--radius', themeData.borderRadius.lg);
    root.style.setProperty('--radius-sm', themeData.borderRadius.sm);
    root.style.setProperty('--radius-md', themeData.borderRadius.md);
    root.style.setProperty('--radius-lg', themeData.borderRadius.lg);
    root.style.setProperty('--radius-xl', themeData.borderRadius.xl);

    // Shadows
    Object.entries(themeData.shadows).forEach(([key, value]) => {
      const cssKey = key === 'default' ? 'shadow' : `shadow-${key}`;
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Update favicon
    if (themeData.assets?.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = themeData.assets.favicon;
    }
  }, [theme, themeName, storageKey, mounted]);

  const value = {
    theme,
    themeName,
    assets: currentTheme?.assets,
    setTheme: (config: ThemeConfig) => {
      // Use next-themes for variant switching (flash-free)
      if (config.variant !== undefined) {
        setNextTheme(config.variant);
      }
      // Handle theme name ourselves
      if (config.name !== undefined) {
        setThemeNameState(config.name);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Main ThemeProvider - wraps children with next-themes and our provider
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  themeName = 'mintblue',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem={false} storageKey={storageKey}>
      <ThemeProviderInner themeName={themeName} storageKey={storageKey}>
        {children}
      </ThemeProviderInner>
    </NextThemesProvider>
  );
}

/**
 * useTheme hook
 *
 * Access current theme and theme setter from context
 *
 * @returns {ThemeProviderState} Current theme, theme name, and setter function
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeProviderState {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
