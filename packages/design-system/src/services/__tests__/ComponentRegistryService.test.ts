/**
 * ComponentRegistryService Tests
 *
 * Tests for component metadata registration, retrieval, and search functionality.
 * Following TDD approach - tests written before implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistryService } from '../ComponentRegistryService';
import type { ComponentMetadata } from '../../types/component.types';

describe('ComponentRegistryService', () => {
  let service: ComponentRegistryService;

  beforeEach(() => {
    service = new ComponentRegistryService();
  });

  describe('registerComponent', () => {
    it('should register a component with complete metadata', () => {
      const metadata: ComponentMetadata = {
        id: 'button',
        name: 'Button',
        description: 'A clickable button component',
        category: 'form',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'outline'",
            description: 'Visual style variant',
            required: false,
            defaultValue: 'primary',
          },
        ],
        examples: [
          {
            title: 'Basic Button',
            code: '<Button>Click me</Button>',
            language: 'tsx',
          },
        ],
        dependencies: ['react'],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('button');
      expect(retrieved).toEqual(metadata);
    });

    it('should register a component with minimal metadata', () => {
      const metadata: ComponentMetadata = {
        id: 'card',
        name: 'Card',
        description: 'A card container',
        category: 'layout',
        props: [],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('card');
      expect(retrieved).toEqual(metadata);
    });

    it('should update component if registered twice with same name', () => {
      const metadata1: ComponentMetadata = {
        id: 'input',
        name: 'Input',
        description: 'Text input',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
      };

      const metadata2: ComponentMetadata = {
        id: 'input',
        name: 'Input',
        description: 'Updated text input with validation',
        category: 'form',
        props: [
          {
            name: 'error',
            type: 'string',
            description: 'Error message',
            required: false,
          },
        ],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata1);
      service.registerComponent(metadata2);

      const retrieved = service.getComponent('input');
      expect(retrieved).toEqual(metadata2);
      expect(retrieved?.description).toBe('Updated text input with validation');
    });

    it('should register component with tags', () => {
      const metadata: ComponentMetadata = {
        id: 'badge',
        name: 'Badge',
        description: 'A small badge',
        category: 'data-display',
        props: [],
        examples: [],
        dependencies: [],
        tags: ['status', 'label', 'indicator'],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('badge');
      expect(retrieved?.tags).toEqual(['status', 'label', 'indicator']);
    });
  });

  describe('getComponent', () => {
    it('should return component metadata by name', () => {
      const metadata: ComponentMetadata = {
        id: 'alert',
        name: 'Alert',
        description: 'An alert message',
        category: 'feedback',
        props: [],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('alert');
      expect(retrieved).toEqual(metadata);
    });

    it('should return null for unknown component', () => {
      const retrieved = service.getComponent('UnknownComponent');
      expect(retrieved).toBeNull();
    });

    it('should be case-sensitive', () => {
      const metadata: ComponentMetadata = {
        id: 'test-button',
        name: 'test-button',
        description: 'A button',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata);

      expect(service.getComponent('test-button')).toEqual(metadata);
      expect(service.getComponent('Test-Button')).toBeNull();
      expect(service.getComponent('TEST-BUTTON')).toBeNull();
    });
  });

  describe('listComponents', () => {
    beforeEach(() => {
      // Register multiple components
      service.registerComponent({
        id: 'button',
        name: 'Button',
        description: 'A button',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
      });

      service.registerComponent({
        id: 'input',
        name: 'Input',
        description: 'An input',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
      });

      service.registerComponent({
        id: 'card',
        name: 'Card',
        description: 'A card',
        category: 'layout',
        props: [],
        examples: [],
        dependencies: [],
      });

      service.registerComponent({
        id: 'alert',
        name: 'Alert',
        description: 'An alert',
        category: 'feedback',
        props: [],
        examples: [],
        dependencies: [],
      });
    });

    it('should list all components when no category provided', () => {
      const components = service.listComponents();
      // Service auto-registers 9 components + 4 test components = 13 total
      // But some test components may overwrite auto-registered ones (Button, Input, Card, Alert)
      // So we still have 9 unique components (4 from auto-registration + 4 from test, with 4 overlaps)
      expect(components.length).toBeGreaterThanOrEqual(9);
      expect(components.map((c) => c.name)).toContain('Button');
      expect(components.map((c) => c.name)).toContain('Input');
      expect(components.map((c) => c.name)).toContain('Card');
      expect(components.map((c) => c.name)).toContain('Alert');
    });

    it('should filter components by category', () => {
      const formComponents = service.listComponents('form');
      // Auto-registered: Button, Input, Select (3) + test Button, Input (overwrite 2) = 3 total
      expect(formComponents.length).toBeGreaterThanOrEqual(2);
      expect(formComponents.map((c) => c.name)).toContain('Button');
      expect(formComponents.map((c) => c.name)).toContain('Input');
    });

    it('should return empty array for unknown category', () => {
      const components = service.listComponents('unknown');
      expect(components).toEqual([]);
    });

    it('should auto-register default components on initialization', () => {
      const newService = new ComponentRegistryService();
      const components = newService.listComponents();
      // Service auto-registers 51 components:
      // - 26 original
      // - 8 from Session 3 (tooltip, popover, hover-card, sonner, sheet, scroll-area, collapsible, accordion)
      // - 2 from Session 3 cards (revenue-card, move-goal-card)
      // - 7 from Session 4 (line-chart, bar-chart, calendar-card, subscription-form-card, create-account-card, exercise-chart-card, payments-table-card)
      // - 5 from Sprint 5E Week 1 (date-picker, command, alert-dialog, combobox, data-table)
      // - 3 from VLEI Support (file-upload, timeline, stepper)
      // - 1 from Admin page (flow-diagram)
      expect(components).toHaveLength(52);
      expect(components.map((c) => c.name)).toContain('Button');
      expect(components.map((c) => c.name)).toContain('Badge');
      expect(components.map((c) => c.name)).toContain('Card');
      expect(components.map((c) => c.name)).toContain('Table');
      expect(components.map((c) => c.name)).toContain('Checkbox');
    });

    it('should return components sorted alphabetically by name', () => {
      const components = service.listComponents();
      const names = components.map((c) => c.name);
      // Use localeCompare to match service's sorting behavior (case-insensitive)
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    });
  });

  describe('searchComponents', () => {
    beforeEach(() => {
      // Register components with various properties
      service.registerComponent({
        id: 'primary-button',
        name: 'PrimaryButton',
        description: 'A primary action button',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
        tags: ['action', 'clickable'],
      });

      service.registerComponent({
        id: 'secondary-button',
        name: 'SecondaryButton',
        description: 'A secondary button for less important actions',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
        tags: ['action', 'clickable'],
      });

      service.registerComponent({
        id: 'text-input',
        name: 'TextInput',
        description: 'A text input field',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
        tags: ['input', 'text'],
      });

      service.registerComponent({
        id: 'card',
        name: 'Card',
        description: 'A card container for grouping content',
        category: 'layout',
        props: [],
        examples: [],
        dependencies: [],
        tags: ['container', 'layout'],
      });
    });

    it('should search components by name (case-insensitive)', () => {
      const results = service.searchComponents('button');
      // Auto-registered Button + test PrimaryButton, SecondaryButton = 3 total
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((c) => c.name)).toContain('PrimaryButton');
      expect(results.map((c) => c.name)).toContain('SecondaryButton');
    });

    it('should search components by description', () => {
      const results = service.searchComponents('primary');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('PrimaryButton');
    });

    it('should search components by tags', () => {
      const results = service.searchComponents('action');
      // Test components PrimaryButton, SecondaryButton have 'action' tag
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((c) => c.name)).toContain('PrimaryButton');
      expect(results.map((c) => c.name)).toContain('SecondaryButton');
    });

    it('should return empty array for no matches', () => {
      const results = service.searchComponents('nonexistent');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      const results = service.searchComponents('');
      expect(results).toEqual([]);
    });

    it('should handle whitespace-only query', () => {
      const results = service.searchComponents('   ');
      expect(results).toEqual([]);
    });

    it('should match partial words', () => {
      const results = service.searchComponents('text');
      // May match auto-registered components + test TextInput
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.map((c) => c.name)).toContain('TextInput');
    });

    it('should return unique results (no duplicates)', () => {
      // Search for "action" which appears in both tags and could match multiple ways
      const results = service.searchComponents('action');
      const names = results.map((c) => c.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should return results sorted alphabetically', () => {
      const results = service.searchComponents('button');
      const names = results.map((c) => c.name);
      // Service uses localeCompare (case-insensitive sort)
      // Verify results are sorted using localeCompare
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
      // Also verify expected components are present
      expect(names).toContain('Button');
      expect(names).toContain('PrimaryButton');
      expect(names).toContain('SecondaryButton');
    });
  });

  describe('edge cases', () => {
    it('should handle component with empty name gracefully', () => {
      const metadata: ComponentMetadata = {
        id: '',
        name: '',
        description: 'Empty name component',
        category: 'utility',
        props: [],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('');
      expect(retrieved).toEqual(metadata);
    });

    it('should handle component with special characters in name', () => {
      const metadata: ComponentMetadata = {
        id: 'button-primary_v2',
        name: 'Button-Primary_v2',
        description: 'A button with special chars',
        category: 'form',
        props: [],
        examples: [],
        dependencies: [],
      };

      service.registerComponent(metadata);

      const retrieved = service.getComponent('button-primary_v2');
      expect(retrieved).toEqual(metadata);
    });

    it('should handle large number of components', () => {
      // Register 100 components
      for (let i = 0; i < 100; i++) {
        service.registerComponent({
          id: `component${i}`,
          name: `Component${i}`,
          description: `Description ${i}`,
          category: 'utility',
          props: [],
          examples: [],
          dependencies: [],
        });
      }

      const all = service.listComponents();
      // 100 test components + 52 auto-registered (48 original + 3 VLEI support + 1 flow-diagram) = 152 total
      expect(all).toHaveLength(152);

      const found = service.getComponent('component50');
      expect(found?.name).toBe('Component50');
    });
  });
});
