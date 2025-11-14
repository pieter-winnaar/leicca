import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '../navigation-menu';

describe('NavigationMenu', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>Test</NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
    expect(container).toBeTruthy();
  });
});
