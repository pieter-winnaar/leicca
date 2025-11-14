# Design System Package

Core design system with themed components, services, and utilities for the MintBlue brand.

## Overview

This package provides a centralized design system with:

- Theme management (light/dark mode support)
- Asset management (fonts, logos, images)
- Component registry for demo applications
- Type-safe interfaces for all services
- Built with oklch colors for perceptual uniformity

## Installation

```bash
pnpm add @design-system-demo/design-system
```

## Usage

### ThemeService

Manage theme configuration and variants:

```typescript
import { ThemeService } from '@design-system-demo/design-system';

// Initialize service
const themeService = new ThemeService();

// Get theme by name
const theme = themeService.getTheme('mintblue');

// Get specific variant (light or dark)
const darkTheme = themeService.getTheme('mintblue', 'dark');

// List available themes
const themes = themeService.listThemes();
// Returns: [{ name: 'mintblue', variants: ['light', 'dark'] }]

// Switch theme variant
themeService.setCurrentVariant('dark');
const currentTheme = themeService.getCurrentTheme();
```

### AssetService

Manage brand assets (fonts, logos, images):

```typescript
import { AssetService } from '@design-system-demo/design-system';

// Initialize service
const assetService = new AssetService();

// Get font family
const font = assetService.getFontFamily('primary');
// Returns: { name: 'Work Sans', fallback: 'sans-serif', weights: [400, 500, 600, 700] }

// Get logo URL
const logoUrl = assetService.getLogoUrl('mintblue', 'light');
// Returns: '/assets/images/mintblue-logo-light.svg'

// Get image URL
const imageUrl = assetService.getImageUrl('hero-background', 'large');
// Returns: '/assets/images/hero-background-large.jpg'

// Get image sizes
const sizes = assetService.getImageSizes();
// Returns: { small: { width: 640, height: 480 }, ... }

// List available assets
const assets = assetService.listAssets();
```

### ComponentRegistryService

Register and retrieve component metadata for demos:

```typescript
import { ComponentRegistryService } from '@design-system-demo/design-system';

// Initialize service (auto-registers all 39 components)
const registry = new ComponentRegistryService();

// Get component by ID
const component = registry.getComponent('button');
console.log(component?.name); // "Button"
console.log(component?.category); // "form"

// List all components (39 total)
const allComponents = registry.listComponents();
console.log(allComponents.length); // 39

// List by category
const formComponents = registry.listComponents('form');
console.log(formComponents.length); // 10

// Search components
const chartComponents = registry.searchComponents('chart');
// Returns: AreaChart, BarChart, LineChart

// Get all categories
const categories = registry.getCategories();
// Returns: ['form', 'layout', 'navigation', 'data-display', 'feedback', 'overlay', 'card-patterns']
```

**39 Components Available:**

- **Form** (10): Button, Input, Select, Checkbox, RadioGroup, Switch, Slider, Textarea, Label, DropdownMenu
- **Layout** (3): Card, Separator, Sidebar
- **Navigation** (4): Tabs, Breadcrumb, NavigationMenu, Pagination
- **Data Display** (10): Badge, Table, Avatar, Progress, MetricCard, AreaChart, BarChart, LineChart, PaymentsTableCard
- **Feedback** (6): Alert, Skeleton, Tooltip, Popover, HoverCard, Sonner
- **Overlay** (5): Dialog, Sheet, Accordion, Collapsible, ScrollArea
- **Card Patterns** (7): RevenueCard, CalendarCard, CreateAccountCard, MoveGoalCard, ExerciseChartCard, SubscriptionFormCard

### ConfigurationService

Combine theme and asset data into complete brand configurations:

```typescript
import {
  ThemeService,
  AssetService,
  ConfigurationService,
} from '@design-system-demo/design-system';

// Initialize with dependency injection
const themeService = new ThemeService();
const assetService = new AssetService();
const configService = new ConfigurationService(themeService, assetService);

// Load brand configuration
const config = configService.loadBrandConfig('mintblue');
// Returns: {
//   brand: 'mintblue',
//   theme: { colors, typography, spacing },
//   assets: { logo, favicon, fonts },
//   metadata: { title, description }
// }

// Get active configuration
const activeConfig = configService.getActiveConfig();

// Validate configuration
const isValid = configService.validateConfig(config);

// Apply custom configuration
configService.applyConfig(customConfig);
```

## Theme Configuration

### Colors

All colors use oklch format for perceptual uniformity:

```typescript
import {
  mintblueTheme,
  mintblueThemeDark,
} from '@design-system-demo/design-system';

// Light mode colors
mintblueTheme.colors.primary; // 'oklch(0.65 0.25 220)' - Brand blue
mintblueTheme.colors.secondary; // 'oklch(0.45 0.20 280)' - Purple accent
mintblueTheme.colors.accent; // 'oklch(0.75 0.15 160)' - Green highlight

// Dark mode colors
mintblueThemeDark.colors.background; // 'oklch(0.15 0 0)' - Dark background
mintblueThemeDark.colors.surface; // 'oklch(0.20 0 0)' - Dark surface
```

### Typography

The MintBlue theme uses Work Sans font family:

```typescript
import { mintblueTheme } from '@design-system-demo/design-system';

mintblueTheme.typography.fontFamily; // 'Work Sans, sans-serif'
mintblueTheme.typography.fontWeights; // { normal: 400, medium: 500, semibold: 600, bold: 700 }
mintblueTheme.typography.fontSize; // { base: '16px', scale: 1.25 }
```

### Spacing

Consistent spacing system:

```typescript
import { mintblueTheme } from '@design-system-demo/design-system';

mintblueTheme.spacing.base; // 4 (px)
mintblueTheme.spacing.scale; // [0, 4, 8, 16, 24, 32, 48, 64, 96, 128]
```

### Border Radius

Rounded corners configuration:

```typescript
import { mintblueTheme } from '@design-system-demo/design-system';

mintblueTheme.borderRadius.sm; // '4px'
mintblueTheme.borderRadius.md; // '8px'
mintblueTheme.borderRadius.lg; // '12px'
mintblueTheme.borderRadius.xl; // '16px'
```

## Architecture

### Service Boundaries

All services follow strict architectural principles:

**Leaf Tier (no dependencies):**

- **ThemeService**: Theme configuration management
- **AssetService**: Brand asset management
- **ComponentRegistryService**: Component metadata registry

**Intermediate Tier (depends on leaf services):**

- **ConfigurationService**: Combines theme and asset data (depends on ThemeService, AssetService)

**Architectural Compliance:**

- All services are under 300 lines
- Constructor-based dependency injection
- Type-safe interfaces

### TypeScript

Strict TypeScript configuration:

- Strict mode enabled
- No implicit any
- Null checks enabled
- Type definitions exported

## Testing

Comprehensive test suite with >80% coverage:

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## Development

```bash
# Type checking
pnpm typecheck

# Build
pnpm build

# Watch mode
pnpm dev

# Lint
pnpm lint
```

## License

Private
