/**
 * Inline Theme Definitions
 *
 * This file exports theme data in a format that can be embedded in the blocking script.
 * It's used to prevent theme flash by injecting CSS variables before React hydration.
 *
 * For LEICCA vLEI Classifier, we use only the d2legaltech theme.
 */

import { d2legaltechTheme, d2legaltechThemeDark } from '@design-system-demo/design-system';

// Build theme data structure for inline script (d2legaltech only for hackathon)
export const themes = {
  d2legaltech: {
    light: d2legaltechTheme,
    dark: d2legaltechThemeDark,
  },
};
