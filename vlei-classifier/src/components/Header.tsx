'use client';

/**
 * Shared Header Component
 *
 * Consistent header across all LEICCA vLEI Classifier pages with:
 * - Logo/Home link
 * - Horizontal tab navigation (Verify, Classify, Anchor, Audit)
 * - Theme switcher
 *
 * Flash prevention: Reads initial logo from data attributes set by blocking script
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, useTheme } from '@design-system-demo/design-system';
import { ShieldCheck, Menu } from 'lucide-react';

const navItems = [
  { href: '/verify', label: 'Verify' },
  { href: '/classify', label: 'Classify' },
  { href: '/anchor', label: 'Anchor' },
  { href: '/audit', label: 'Audit' },
];

const adminNavItem = { href: '/admin', label: 'Admin' };

export function Header() {
  const pathname = usePathname();
  const { theme, themeName, assets } = useTheme();

  // Read logo directly from data attributes (set by blocking script) or context
  const getLogoSrc = () => {
    // Prefer context assets if available
    if (assets?.logo) {
      return theme === 'dark' ? assets.logo.dark : assets.logo.light;
    }

    // Fallback to data attributes (available immediately from blocking script)
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const themeVariant = root.getAttribute('data-theme-variant') || 'light';
      const logoLight = root.getAttribute('data-logo-light');
      const logoDark = root.getAttribute('data-logo-dark');

      if (logoLight && logoDark) {
        return themeVariant === 'dark' ? logoDark : logoLight;
      }
    }

    return null;
  };

  const logoSrc = getLogoSrc();
  const displayName = assets ? themeName : (typeof window !== 'undefined' ? document.documentElement.getAttribute('data-theme-name') : null);

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Enhanced single row with better spacing and visual hierarchy */}
        <div className="flex h-20 items-center gap-3 sm:gap-4 lg:gap-6">
          {/* Left: Logo with increased size */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            {/* Logo placeholder - blocking script injects logo here before React hydrates */}
            <div id="logo-placeholder" suppressHydrationWarning>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`${displayName || 'LEICCA'} logo`}
                  className="h-8 w-auto max-h-8"
                />
              ) : (
                <>
                  <ShieldCheck className="h-8 w-8" />
                  <span className="hidden sm:inline">LEICCA</span>
                </>
              )}
            </div>
          </Link>

          {/* Subtle visual separator */}
          <div className="hidden sm:block h-6 w-px bg-border" />

          {/* Center: Horizontal Tab Navigation with improved spacing */}
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto" aria-label="Main navigation">
            {/* Desktop: All tabs visible with better spacing */}
            <div className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 xl:px-4 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-primary bg-accent shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              {/* Admin link - visually separated */}
              <div className="hidden lg:block h-6 w-px bg-border ml-1 mr-1" />
              <Link
                href={adminNavItem.href}
                className={`px-3 xl:px-4 py-2 text-sm font-medium transition-all rounded-lg whitespace-nowrap ${
                  isActive(adminNavItem.href)
                    ? 'text-primary bg-accent shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
                aria-current={isActive(adminNavItem.href) ? 'page' : undefined}
              >
                {adminNavItem.label}
              </Link>
            </div>

            {/* Mobile: Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Open navigation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={isActive(item.href) ? 'text-primary font-medium' : ''}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem asChild>
                    <Link
                      href={adminNavItem.href}
                      className={isActive(adminNavItem.href) ? 'text-primary font-medium' : ''}
                    >
                      {adminNavItem.label}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* Subtle visual separator */}
          <div className="hidden sm:block h-6 w-px bg-border" />

          {/* Right: Theme Switcher */}
          <div className="flex items-center flex-shrink-0">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
