import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeService } from '../ThemeService';
import type { Theme } from '../../types/theme.types';

describe('ThemeService', () => {
  let themeService: ThemeService;

  beforeEach(() => {
    themeService = new ThemeService();
  });

  describe('constructor', () => {
    it('should create an instance without dependencies (leaf service)', () => {
      expect(themeService).toBeDefined();
      expect(themeService).toBeInstanceOf(ThemeService);
    });
  });

  describe('getTheme', () => {
    it('should load the mintblue theme', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme).toBeDefined();
      expect(theme.name).toBe('mintblue');
      expect(theme.colors).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.borderRadius).toBeDefined();
    });

    it('should return theme with oklch color format', () => {
      const theme = themeService.getTheme('mintblue');

      // Check that primary color uses oklch format
      expect(theme.colors.primary).toMatch(/^oklch\(/);
      expect(theme.colors.secondary).toMatch(/^oklch\(/);
      expect(theme.colors.accent).toMatch(/^oklch\(/);
      expect(theme.colors.background).toMatch(/^oklch\(/);
      expect(theme.colors.foreground).toMatch(/^oklch\(/);
    });

    it('should return theme with Work Sans font family', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme.typography.fontFamilies.sans).toContain('Work Sans');
      expect(theme.typography.fontFamilies.serif).toContain('Work Sans');
      expect(theme.typography.fontFamilies.mono).toContain('monospace');
    });

    it('should return theme with complete typography scale', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme.typography.fontSize.xs).toBe('0.75rem');
      expect(theme.typography.fontSize.sm).toBe('0.875rem');
      expect(theme.typography.fontSize.base).toBe('1rem');
      expect(theme.typography.fontSize.lg).toBe('1.125rem');
      expect(theme.typography.fontSize.xl).toBe('1.25rem');
      expect(theme.typography.fontSize['2xl']).toBe('1.5rem');
      expect(theme.typography.fontSize['3xl']).toBe('1.875rem');
      expect(theme.typography.fontSize['4xl']).toBe('2.25rem');
    });

    it('should return theme with font weights', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme.typography.fontWeight.normal).toBe(400);
      expect(theme.typography.fontWeight.medium).toBe(500);
      expect(theme.typography.fontWeight.semibold).toBe(600);
      expect(theme.typography.fontWeight.bold).toBe(700);
    });

    it('should return theme with spacing scale', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme.spacing.xs).toBe('0.25rem');
      expect(theme.spacing.sm).toBe('0.5rem');
      expect(theme.spacing.md).toBe('1rem');
      expect(theme.spacing.lg).toBe('1.5rem');
      expect(theme.spacing.xl).toBe('2rem');
      expect(theme.spacing['2xl']).toBe('3rem');
      expect(theme.spacing['3xl']).toBe('4rem');
    });

    it('should return theme with border radius values', () => {
      const theme = themeService.getTheme('mintblue');

      expect(theme.borderRadius.none).toBe('0');
      expect(theme.borderRadius.sm).toBe('calc(0.625rem - 4px)');
      expect(theme.borderRadius.md).toBe('calc(0.625rem - 2px)');
      expect(theme.borderRadius.lg).toBe('0.625rem');
      expect(theme.borderRadius.xl).toBe('calc(0.625rem + 4px)');
      expect(theme.borderRadius['2xl']).toBe('1rem');
      expect(theme.borderRadius.full).toBe('9999px');
    });

    it('should throw error for unknown theme name', () => {
      expect(() => themeService.getTheme('nonexistent')).toThrow();
      expect(() => themeService.getTheme('nonexistent')).toThrow('Theme "nonexistent" not found');
    });
  });

  describe('getThemeVariant', () => {
    it('should return light variant by default', () => {
      const lightTheme = themeService.getThemeVariant('mintblue', 'light');

      expect(lightTheme).toBeDefined();
      expect(lightTheme.name).toBe('mintblue');
      // Light mode should have light background (actual value from theme)
      expect(lightTheme.colors.background).toBe('oklch(0.9846 0.0017 247.8389)');
    });

    it('should return dark variant with adjusted colors', () => {
      const darkTheme = themeService.getThemeVariant('mintblue', 'dark');

      expect(darkTheme).toBeDefined();
      expect(darkTheme.name).toBe('mintblue');

      // Dark mode should have dark background (actual value from theme)
      expect(darkTheme.colors.background).toBe('oklch(0.1450 0 0)');

      // Dark mode should have light foreground with cyan tint (correct value from tweakcn)
      expect(darkTheme.colors.foreground).toBe('oklch(0.9802 0.0272 179.7175)');
    });

    it('should have different primary color in dark variant', () => {
      const lightTheme = themeService.getThemeVariant('mintblue', 'light');
      const darkTheme = themeService.getThemeVariant('mintblue', 'dark');

      // Primary color is DIFFERENT in dark mode (light cyan instead of blue)
      expect(darkTheme.colors.primary).not.toBe(lightTheme.colors.primary);
      expect(lightTheme.colors.primary).toBe('oklch(0.452 0.313 264.052)'); // Blue in light mode
      expect(darkTheme.colors.primary).toBe('oklch(0.9582 0.0595 184.5549)'); // Cyan in dark mode
    });

    it('should throw error for unknown theme name', () => {
      expect(() => themeService.getThemeVariant('nonexistent', 'light')).toThrow();
      expect(() => themeService.getThemeVariant('nonexistent', 'dark')).toThrow();
    });

    it('should return claude theme light variant with signature orange primary', () => {
      const claudeLight = themeService.getThemeVariant('claude', 'light');

      expect(claudeLight).toBeDefined();
      expect(claudeLight.name).toBe('claude');
      // Claude's signature orange in light mode
      expect(claudeLight.colors.primary).toBe('oklch(0.6171 0.1375 39.0427)');
    });

    it('should return claude theme dark variant with brighter orange primary', () => {
      const claudeDark = themeService.getThemeVariant('claude', 'dark');

      expect(claudeDark).toBeDefined();
      expect(claudeDark.name).toBe('claude');
      // Claude's signature orange in dark mode (brighter)
      expect(claudeDark.colors.primary).toBe('oklch(0.6724 0.1308 38.7559)');
    });

    it('should return claude theme with system font stack', () => {
      const claudeTheme = themeService.getTheme('claude');

      expect(claudeTheme.typography.fontFamilies.sans).toContain('ui-sans-serif');
      expect(claudeTheme.typography.fontFamilies.sans).toContain('system-ui');
    });

    it('should return ing theme light variant with signature orange primary', () => {
      const ingLight = themeService.getThemeVariant('ing', 'light');

      expect(ingLight).toBeDefined();
      expect(ingLight.name).toBe('ing');
      // ING's signature orange in light mode
      expect(ingLight.colors.primary).toBe('oklch(0.6724 0.1951 42.9956)');
    });

    it('should return ing theme dark variant with brighter orange primary', () => {
      const ingDark = themeService.getThemeVariant('ing', 'dark');

      expect(ingDark).toBeDefined();
      expect(ingDark.name).toBe('ing');
      // ING's signature orange in dark mode (brighter)
      expect(ingDark.colors.primary).toBe('oklch(0.7240 0.1951 42.9956)');
    });

    it('should return ing theme with system font stack', () => {
      const ingTheme = themeService.getTheme('ing');

      expect(ingTheme.typography.fontFamilies.sans).toContain('-apple-system');
      expect(ingTheme.typography.fontFamilies.sans).toContain('BlinkMacSystemFont');
    });
  });

  describe('listAvailableThemes', () => {
    it('should return array of available theme names', () => {
      const themes = themeService.listAvailableThemes();

      expect(themes).toBeInstanceOf(Array);
      expect(themes.length).toBeGreaterThan(0);
    });

    it('should include mintblue theme', () => {
      const themes = themeService.listAvailableThemes();

      expect(themes).toContain('mintblue');
    });

    it('should include amber theme', () => {
      const themes = themeService.listAvailableThemes();

      expect(themes).toContain('amber');
    });

    it('should include claude theme', () => {
      const themes = themeService.listAvailableThemes();

      expect(themes).toContain('claude');
    });

    it('should include ing theme', () => {
      const themes = themeService.listAvailableThemes();

      expect(themes).toContain('ing');
    });
  });

  describe('validateTheme', () => {
    it('should validate a complete theme structure', () => {
      const theme = themeService.getTheme('mintblue');

      expect(themeService.validateTheme(theme)).toBe(true);
    });

    it('should return false for incomplete theme (missing colors)', () => {
      const incompleteTheme = {
        name: 'test',
        typography: {
          fontFamily: 'Test Font',
          fontSize: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
          fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 }
        },
        spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem' },
        borderRadius: { none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem', full: '9999px' }
      } as Theme;

      expect(themeService.validateTheme(incompleteTheme)).toBe(false);
    });

    it('should return false for theme missing sidebarColors', () => {
      const theme = themeService.getTheme('mintblue');
      const invalidTheme = {
        ...theme,
        sidebarColors: undefined as any
      };

      expect(themeService.validateTheme(invalidTheme)).toBe(false);
    });

    it('should return false for theme with missing typography', () => {
      const theme = themeService.getTheme('mintblue');
      const invalidTheme = {
        ...theme,
        typography: undefined as any
      };

      expect(themeService.validateTheme(invalidTheme)).toBe(false);
    });
  });
});
