/**
 * ThemeService
 *
 * TIER: Leaf (NO dependencies)
 * LOCATION: packages/design-system/src/services/ThemeService.ts
 *
 * Responsibilities:
 * - Load theme definitions (colors, typography, spacing)
 * - Provide theme variants (light/dark modes)
 * - Manage oklch color conversions
 * - Validate theme structure
 *
 * Does NOT:
 * - Load assets (logos, fonts) - that's AssetService
 * - Manage component registration - that's ComponentRegistryService
 * - Handle blockchain operations - use @bsv/sdk or MintBlueSDKService directly
 */

import type { Theme, ThemeVariant } from '../types/theme.types';
import { mintblueTheme, mintblueThemeDark } from '../themes/mintblue.theme';
import { mintblueV2Theme, mintblueV2ThemeDark } from '../themes/mintblue-v2.theme';
import { amberTheme, amberThemeDark } from '../themes/amber.theme';
import { claudeTheme, claudeThemeDark } from '../themes/claude.theme';
import { ingTheme, ingThemeDark } from '../themes/ing.theme';
import { d2legaltechTheme, d2legaltechThemeDark } from '../themes/d2legaltech.theme';

export class ThemeService {
  private themes: Map<string, Theme>;

  constructor() {
    // No dependencies - leaf service
    this.themes = new Map();
    this.initializeThemes();
  }

  /**
   * Initialize built-in themes
   */
  private initializeThemes(): void {
    // Register mintBlue theme from theme definition file
    this.themes.set('mintblue', mintblueTheme);
    // Register mintBlue V2 theme with updated color palette
    this.themes.set('mintblue-v2', mintblueV2Theme);
    // Register Amber Minimal theme
    this.themes.set('amber', amberTheme);
    // Register Claude theme
    this.themes.set('claude', claudeTheme);
    // Register ING Bank theme
    this.themes.set('ing', ingTheme);
    // Register D2 Legal Technology theme
    this.themes.set('d2legaltech', d2legaltechTheme);
  }

  /**
   * Get theme by name
   * @param themeName - Name of the theme to load
   * @returns Theme configuration
   * @throws Error if theme not found
   */
  getTheme(themeName: string): Theme {
    const theme = this.themes.get(themeName);

    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`);
    }

    return theme;
  }

  /**
   * Get theme variant (light or dark mode)
   * @param themeName - Name of the base theme
   * @param variant - 'light' or 'dark'
   * @returns Theme with variant-specific colors and sidebar colors
   * @throws Error if theme not found
   */
  getThemeVariant(themeName: string, variant: ThemeVariant): Theme {
    // Return appropriate variant for each theme
    if (themeName === 'mintblue') {
      return variant === 'dark' ? mintblueThemeDark : mintblueTheme;
    }

    if (themeName === 'mintblue-v2') {
      return variant === 'dark' ? mintblueV2ThemeDark : mintblueV2Theme;
    }

    if (themeName === 'amber') {
      return variant === 'dark' ? amberThemeDark : amberTheme;
    }

    if (themeName === 'claude') {
      return variant === 'dark' ? claudeThemeDark : claudeTheme;
    }

    if (themeName === 'ing') {
      return variant === 'dark' ? ingThemeDark : ingTheme;
    }

    if (themeName === 'd2legaltech') {
      return variant === 'dark' ? d2legaltechThemeDark : d2legaltechTheme;
    }

    // Fallback to base theme for unknown themes
    return this.getTheme(themeName);
  }

  /**
   * List all available theme names
   * @returns Array of theme names
   */
  listAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Validate theme structure
   * @param theme - Theme to validate
   * @returns true if valid, false otherwise
   */
  validateTheme(theme: Theme): boolean {
    try {
      // Check basic structure
      if (!theme || typeof theme !== 'object') {
        return false;
      }

      // Check required properties
      if (!theme.name || !theme.colors || !theme.sidebarColors || !theme.chartColors ||
          !theme.typography || !theme.spacing || !theme.borderRadius || !theme.shadows) {
        return false;
      }

      // Validate typography has fontFamilies object
      if (!theme.typography.fontFamilies || typeof theme.typography.fontFamilies !== 'object') {
        return false;
      }

      if (!theme.typography.fontFamilies.sans || !theme.typography.fontFamilies.serif || !theme.typography.fontFamilies.mono) {
        return false;
      }

      if (!theme.typography.fontSize || typeof theme.typography.fontSize !== 'object') {
        return false;
      }

      if (!theme.typography.fontWeight || typeof theme.typography.fontWeight !== 'object') {
        return false;
      }

      // Validate spacing
      if (!theme.spacing || typeof theme.spacing !== 'object') {
        return false;
      }

      // Validate border radius
      if (!theme.borderRadius || typeof theme.borderRadius !== 'object') {
        return false;
      }

      // Validate shadows
      if (!theme.shadows || typeof theme.shadows !== 'object') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}