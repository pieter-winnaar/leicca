/**
 * ComponentRegistryService
 *
 * TIER: Leaf (NO dependencies)
 * LOCATION: packages/design-system/src/services/ComponentRegistryService.ts
 *
 * Responsibilities:
 * - Register component metadata (name, props, category)
 * - Provide component search and filtering
 * - Track component dependencies
 * - Generate component documentation data
 *
 * Does NOT:
 * - Apply themes to components - that's ThemeService + ConfigurationService
 * - Render components - that's React
 * - Handle deployments - that's DeploymentService
 */

import type { ComponentMetadata } from '../types/component.types';
import {
  buttonMetadata,
  badgeMetadata,
  cardMetadata,
  inputMetadata,
  selectMetadata,
  alertMetadata,
  dialogMetadata,
  tabsMetadata,
  dropdownMenuMetadata,
  tableMetadata,
  avatarMetadata,
  progressMetadata,
  skeletonMetadata,
  separatorMetadata,
  checkboxMetadata,
  radioGroupMetadata,
  switchMetadata,
  sliderMetadata,
  textareaMetadata,
  labelMetadata,
  breadcrumbMetadata,
  paginationMetadata,
  navigationMenuMetadata,
  sidebarMetadata,
  metricCardMetadata,
  areaChartMetadata,
  tooltipMetadata,
  popoverMetadata,
  hoverCardMetadata,
  sonnerMetadata,
  sheetMetadata,
  scrollAreaMetadata,
  collapsibleMetadata,
  accordionMetadata,
  revenueCardMetadata,
  moveGoalCardMetadata,
  lineChartMetadata,
  barChartMetadata,
  calendarCardMetadata,
  subscriptionFormCardMetadata,
  createAccountCardMetadata,
  exerciseChartCardMetadata,
  paymentsTableCardMetadata,
  datePickerMetadata,
  commandMetadata,
  alertDialogMetadata,
  comboboxMetadata,
  dataTableMetadata,
  fileUploadMetadata,
  timelineMetadata,
  stepperMetadata,
  flowDiagramMetadata,
} from '../metadata';

export class ComponentRegistryService {
  private components: Map<string, ComponentMetadata>;

  constructor() {
    // No dependencies - leaf service
    this.components = new Map();

    // Auto-register all component metadata
    this.registerDefaultComponents();
  }

  /**
   * Register all default component metadata
   * Called automatically during initialization
   * @private
   */
  private registerDefaultComponents(): void {
    this.registerComponent(buttonMetadata);
    this.registerComponent(badgeMetadata);
    this.registerComponent(cardMetadata);
    this.registerComponent(inputMetadata);
    this.registerComponent(selectMetadata);
    this.registerComponent(alertMetadata);
    this.registerComponent(dialogMetadata);
    this.registerComponent(tabsMetadata);
    this.registerComponent(dropdownMenuMetadata);
    this.registerComponent(tableMetadata);
    this.registerComponent(avatarMetadata);
    this.registerComponent(progressMetadata);
    this.registerComponent(skeletonMetadata);
    this.registerComponent(separatorMetadata);
    this.registerComponent(checkboxMetadata);
    this.registerComponent(radioGroupMetadata);
    this.registerComponent(switchMetadata);
    this.registerComponent(sliderMetadata);
    this.registerComponent(textareaMetadata);
    this.registerComponent(labelMetadata);
    this.registerComponent(breadcrumbMetadata);
    this.registerComponent(paginationMetadata);
    this.registerComponent(navigationMenuMetadata);
    this.registerComponent(sidebarMetadata);
    this.registerComponent(metricCardMetadata);
    this.registerComponent(areaChartMetadata);
    this.registerComponent(tooltipMetadata);
    this.registerComponent(popoverMetadata);
    this.registerComponent(hoverCardMetadata);
    this.registerComponent(sonnerMetadata);
    this.registerComponent(sheetMetadata);
    this.registerComponent(scrollAreaMetadata);
    this.registerComponent(collapsibleMetadata);
    this.registerComponent(accordionMetadata);
    this.registerComponent(revenueCardMetadata);
    this.registerComponent(moveGoalCardMetadata);
    this.registerComponent(lineChartMetadata);
    this.registerComponent(barChartMetadata);
    this.registerComponent(calendarCardMetadata);
    this.registerComponent(subscriptionFormCardMetadata);
    this.registerComponent(createAccountCardMetadata);
    this.registerComponent(exerciseChartCardMetadata);
    this.registerComponent(paymentsTableCardMetadata);
    this.registerComponent(datePickerMetadata);
    this.registerComponent(commandMetadata);
    this.registerComponent(alertDialogMetadata);
    this.registerComponent(comboboxMetadata);
    this.registerComponent(dataTableMetadata);
    this.registerComponent(fileUploadMetadata);
    this.registerComponent(timelineMetadata);
    this.registerComponent(stepperMetadata);
    this.registerComponent(flowDiagramMetadata);
  }

  /**
   * Register a component with its metadata
   *
   * @param metadata - Component metadata including name, props, examples
   *
   * If a component with the same id already exists, it will be updated.
   */
  registerComponent(metadata: ComponentMetadata): void {
    this.components.set(metadata.id, metadata);
  }

  /**
   * Get component metadata by id
   *
   * @param id - Component id (case-sensitive)
   * @returns Component metadata or null if not found
   */
  getComponent(id: string): ComponentMetadata | null {
    return this.components.get(id) ?? null;
  }

  /**
   * List all components, optionally filtered by category
   *
   * @param category - Optional category filter
   * @returns Array of component metadata, sorted alphabetically by name
   */
  listComponents(category?: string): ComponentMetadata[] {
    const allComponents = Array.from(this.components.values());

    // Filter by category if provided
    const filtered = category
      ? allComponents.filter((component) => component.category === category)
      : allComponents;

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Search components by name, description, or tags
   *
   * @param query - Search query string (case-insensitive)
   * @returns Array of matching components, sorted alphabetically by name
   *
   * Returns empty array if query is empty or whitespace-only.
   * Searches in: component name, description, and tags.
   */
  searchComponents(query: string): ComponentMetadata[] {
    // Normalize query
    const normalizedQuery = query.trim().toLowerCase();

    // Return empty array for empty query
    if (!normalizedQuery) {
      return [];
    }

    // Search in name, description, and tags
    const matches = Array.from(this.components.values()).filter((component) => {
      // Check name
      if (component.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Check description
      if (component.description.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Check tags
      if (component.tags) {
        const tagMatch = component.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedQuery)
        );
        if (tagMatch) {
          return true;
        }
      }

      return false;
    });

    // Remove duplicates and sort alphabetically
    const uniqueMatches = Array.from(
      new Map(matches.map((component) => [component.id, component])).values()
    );

    return uniqueMatches.sort((a, b) => a.name.localeCompare(b.name));
  }
}
