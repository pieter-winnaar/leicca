'use client';

/**
 * Client Component Providers
 *
 * Wraps client-side providers (ThemeProvider, Toaster) to keep layout.tsx as server component
 */

import { ThemeProvider, Toaster } from '@design-system-demo/design-system';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" themeName="d2legaltech" storageKey="leicca-theme">
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
