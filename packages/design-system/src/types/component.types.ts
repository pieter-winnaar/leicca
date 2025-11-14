/**
 * Component Registry Type Definitions
 *
 * Defines the structure for component metadata, props, and examples
 * used by the ComponentRegistryService.
 */

/**
 * Prop definition for component documentation
 */
export interface PropDefinition {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * Code example for component usage
 */
export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language?: 'tsx' | 'jsx' | 'typescript' | 'javascript';
  preview?: React.ReactNode;
}

/**
 * Component metadata for registry
 */
export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  variants?: string[];
  preview: React.ReactNode;
  props: PropDefinition[];
  examples: CodeExample[];
  dependencies: string[];
  tags?: string[];
}

/**
 * Component category type
 */
export type ComponentCategory =
  | 'form'
  | 'layout'
  | 'navigation'
  | 'data-display'
  | 'feedback'
  | 'overlay'
  | 'typography'
  | 'utility';

/**
 * Search filter options
 */
export interface ComponentSearchFilter {
  query?: string;
  category?: string;
  tags?: string[];
}
