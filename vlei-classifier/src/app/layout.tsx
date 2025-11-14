import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import { Header } from '../components/Header';
import { themes } from '../lib/themeConstants';

export const metadata: Metadata = {
  title: 'LEICCA vLEI Classifier | D2 Legal Technology',
  description: 'vLEI verification and Basel CCR classification with blockchain audit trails',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script to inject theme CSS variables BEFORE React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    const storageKey = 'leicca-theme';
    const themeName = localStorage.getItem(storageKey + '-name') || 'd2legaltech';
    const themeVariant = localStorage.getItem(storageKey) || 'light';

    // Inline theme definitions (extracted from ThemeService)
    const themes = ${JSON.stringify(themes)};

    const theme = themes[themeName]?.[themeVariant] || themes.d2legaltech.light;
    const root = document.documentElement;

    // Inject CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const stripped = value.replace(/^oklch\\((.*)\\)$/, '$1');
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty('--' + cssKey, stripped);
    });

    Object.entries(theme.sidebarColors).forEach(([key, value]) => {
      const stripped = value.replace(/^oklch\\((.*)\\)$/, '$1');
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty('--' + cssKey, stripped);
    });

    Object.entries(theme.chartColors).forEach(([key, value]) => {
      const stripped = value.replace(/^oklch\\((.*)\\)$/, '$1');
      const cssKey = key.replace(/^chart(\\d)$/, 'chart-$1');
      root.style.setProperty('--' + cssKey, stripped);
    });

    root.style.setProperty('--font-sans', theme.typography.fontFamilies.sans);
    root.style.setProperty('--font-serif', theme.typography.fontFamilies.serif);
    root.style.setProperty('--font-mono', theme.typography.fontFamilies.mono);
    root.style.setProperty('--radius', theme.borderRadius.lg);

    // Set favicon
    if (theme.assets?.favicon) {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = theme.assets.favicon;
      document.head.appendChild(favicon);
    }

    // Store theme name and variant as data attributes
    root.setAttribute('data-theme-name', themeName);
    root.setAttribute('data-theme-variant', themeVariant);

    // Store logo paths for Header component
    if (theme.assets?.logo) {
      root.setAttribute('data-logo-light', theme.assets.logo.light);
      root.setAttribute('data-logo-dark', theme.assets.logo.dark);
    }

    // Inject logo HTML directly into placeholder (prevents flash)
    if (theme.assets?.logo) {
      const logoPlaceholder = document.getElementById('logo-placeholder');
      if (logoPlaceholder) {
        const logoSrc = themeVariant === 'dark' ? theme.assets.logo.dark : theme.assets.logo.light;
        logoPlaceholder.innerHTML = '<img src="' + logoSrc + '" alt="' + themeName + ' logo" class="h-8 w-auto max-h-8" />';
      }
    }
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
