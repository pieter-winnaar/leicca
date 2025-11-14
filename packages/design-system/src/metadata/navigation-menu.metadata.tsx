import type { ComponentMetadata } from '../types/component.types';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '../components/navigation-menu';

export const navigationMenuMetadata: ComponentMetadata = {
  id: 'navigation-menu',
  name: 'Navigation Menu',
  description: 'Accessible dropdown navigation menu with keyboard support',
  category: 'navigation',
  variants: ['default'],
  preview: (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2">
              <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                <div className="text-sm font-medium">Analytics</div>
                <p className="text-sm text-muted-foreground">Data insights</p>
              </NavigationMenuLink>
              <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                <div className="text-sm font-medium">Dashboard</div>
                <p className="text-sm text-muted-foreground">Visualize metrics</p>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
  props: [
    {
      name: 'className',
      type: 'string',
      description: 'Additional CSS classes',
      required: false,
    },
  ],
  examples: [
    {
      title: 'Multi-Column Navigation',
      description: 'Navigation menu with rich dropdown content and multiple columns',
      code: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-3 p-4 md:w-[500px] md:grid-cols-2">
          <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent">
            <div className="text-sm font-medium">Analytics</div>
            <p className="text-sm text-muted-foreground">
              Track and analyze your data
            </p>
          </NavigationMenuLink>
          <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent">
            <div className="text-sm font-medium">Dashboard</div>
            <p className="text-sm text-muted-foreground">
              Visualize key metrics
            </p>
          </NavigationMenuLink>
          <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent">
            <div className="text-sm font-medium">Reports</div>
            <p className="text-sm text-muted-foreground">
              Generate detailed reports
            </p>
          </NavigationMenuLink>
          <NavigationMenuLink className="block space-y-1 rounded-md p-3 hover:bg-accent">
            <div className="text-sm font-medium">API</div>
            <p className="text-sm text-muted-foreground">
              Integrate with your apps
            </p>
          </NavigationMenuLink>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-2 p-4 w-[250px]">
          <NavigationMenuLink className="block rounded-md p-2 hover:bg-accent">
            <div className="text-sm font-medium">Documentation</div>
          </NavigationMenuLink>
          <NavigationMenuLink className="block rounded-md p-2 hover:bg-accent">
            <div className="text-sm font-medium">Blog</div>
          </NavigationMenuLink>
          <NavigationMenuLink className="block rounded-md p-2 hover:bg-accent">
            <div className="text-sm font-medium">Support</div>
          </NavigationMenuLink>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
        Pricing
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
      language: 'tsx',
      preview: (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Analytics</div>
                    <p className="text-sm text-muted-foreground">
                      Track and analyze your data
                    </p>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Dashboard</div>
                    <p className="text-sm text-muted-foreground">
                      Visualize key metrics
                    </p>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Reports</div>
                    <p className="text-sm text-muted-foreground">
                      Generate detailed reports
                    </p>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">API</div>
                    <p className="text-sm text-muted-foreground">
                      Integrate with your apps
                    </p>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-2 p-4 w-[250px]">
                  <NavigationMenuLink className="block select-none rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Documentation</div>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block select-none rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Blog</div>
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block select-none rounded-md p-2 hover:bg-accent hover:text-accent-foreground">
                    <div className="text-sm font-medium">Support</div>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ),
    },
  ],
  dependencies: ['react', '@radix-ui/react-navigation-menu', 'lucide-react'],
  tags: ['navigation', 'menu', 'dropdown', 'header', 'navbar'],
};
