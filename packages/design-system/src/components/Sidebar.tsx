import * as React from 'react';
import { ChevronLeft, ChevronRight, Home, Users, FileText, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Separator } from './separator';
import { useTheme } from './ThemeProvider';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  navItems?: SidebarNavItem[];
  activeItem?: string;
  onNavItemClick?: (href: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      logo,
      navItems = [],
      activeItem,
      onNavItemClick,
      collapsed = false,
      onToggleCollapse,
      userAvatar,
      userName = 'User',
      userEmail,
      onLogout,
      ...props
    },
    ref
  ) => {
    const { theme, themeName, assets } = useTheme();

    // Get logo from theme assets if not provided as prop
    const getLogoSrc = () => {
      if (assets?.logo) {
        return theme === 'dark' ? assets.logo.dark : assets.logo.light;
      }
      return null;
    };

    const logoSrc = getLogoSrc();
    const displayName = themeName;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-card border-r border-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          className
        )}
        {...props}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 h-16">
          {!collapsed && (
            <div className="flex-1 flex items-center gap-2">
              {logo || (logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`${displayName} logo`}
                  className="h-6 w-auto max-h-6"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {displayName?.substring(0, 2).toUpperCase() || 'MB'}
                </div>
              ))}
            </div>
          )}
          {collapsed && (logo || logoSrc) && (
            <div className="flex items-center justify-center w-full">
              {logo || (logoSrc && (
                <img
                  src={logoSrc}
                  alt={`${displayName} logo`}
                  className="h-6 w-auto max-h-6"
                />
              ))}
            </div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <Separator />

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.href;

            return (
              <button
                key={item.href}
                onClick={() => onNavItemClick?.(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  isActive && 'bg-primary text-primary-foreground',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <Separator />

        {/* User Profile Section */}
        <div className="p-4">
          <div
            className={cn(
              'flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors cursor-pointer',
              collapsed && 'justify-center'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>
                {userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                {userEmail && (
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                )}
              </div>
            )}
          </div>
          {!collapsed && onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full mt-2 justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar };

// Default nav items for demo purposes
export const defaultNavItems: SidebarNavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Team', href: '/team', icon: Users, badge: 3 },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];
