'use client';

/**
 * ThemeSwitcher
 *
 * LOCATION: packages/design-system/src/components/ThemeSwitcher.tsx
 *
 * Comprehensive theme switcher for both theme names and light/dark variants
 * Uses DropdownMenu for theme selection and toggle buttons for light/dark
 *
 * Features:
 * - Switch between available themes (mintblue, amber, etc.)
 * - Toggle between light and dark mode
 * - localStorage persistence (handled by ThemeProvider)
 * - Keyboard accessible
 * - ARIA labels for screen readers
 * - Live preview
 *
 * Usage:
 * ```tsx
 * <ThemeSwitcher />
 * ```
 */

import * as React from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { ThemeService } from '../services/ThemeService';

export function ThemeSwitcher() {
  const { theme, themeName, setTheme } = useTheme();
  const [availableThemes, setAvailableThemes] = React.useState<string[]>([]);

  // Load available themes on mount
  React.useEffect(() => {
    const themeService = new ThemeService();
    const themes = themeService.listAvailableThemes();
    setAvailableThemes(themes);
  }, []);

  const toggleVariant = () => {
    // Just toggle variant, keep current theme name
    setTheme({ variant: theme === 'light' ? 'dark' : 'light' });
  };

  const changeThemeName = (name: string) => {
    // Just change theme name, keep current variant
    setTheme({ name });
  };

  const capitalizeThemeName = (name: string) => {
    // Special case for mintBlue brand
    if (name === 'mintblue') return 'mintBlue';
    if (name === 'mintblue-v2') return 'mintBlue V2';
    // Special case for ING (all caps)
    if (name === 'ing') return 'ING';
    // Default: capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Theme Name Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label="Select theme"
            title="Select theme"
          >
            <Palette className="h-4 w-4 mr-2" />
            {capitalizeThemeName(themeName)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableThemes.map((name) => (
            <DropdownMenuItem
              key={name}
              onClick={() => changeThemeName(name)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{capitalizeThemeName(name)}</span>
              {themeName === name && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Light/Dark Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVariant}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
        )}
        <span className="sr-only">Toggle theme variant</span>
      </Button>
    </div>
  );
}
