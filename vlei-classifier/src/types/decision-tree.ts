/**
 * LEICCA Decision Tree Types
 *
 * Based on real LEICCA (LEI Counterparty Classification Assistant) data structure
 * from the LEICCA team. This replaces the previous DynamoDB/mock types.
 */

/**
 * Node types supported by LEICCA decision trees
 */
export type NodeType = 'start' | 'select' | 'question' | 'screenshot' | 'end';

/**
 * Selection option for 'select' node types
 */
export interface SelectOption {
  id: string;
  text: string;
  nextNodeId: string;
}

/**
 * Classification outcome for 'end' nodes
 */
export interface ClassificationOutcome {
  success: boolean;
  classification: string;
  category: string;
  description: string;
}

/**
 * Decision tree node - represents a single step in the classification flow
 *
 * Different node types use different fields:
 * - start: continueTarget
 * - select: selectOptions[]
 * - question: yesTarget, noTarget
 * - screenshot: continueTarget
 * - end: outcome
 */
export interface LEICCADecisionTreeNode {
  id: string;
  nodeType: NodeType;
  nodeText: string;

  // Hover guidance (optional)
  hoverLabel: string | null;
  hoverText: string | null;

  // For question nodes (binary yes/no)
  yesTarget?: string;
  noTarget?: string;

  // For select nodes (dropdown)
  selectOptions?: SelectOption[];

  // For start/screenshot nodes
  continueTarget?: string;

  // For end nodes
  outcome?: ClassificationOutcome;
}

/**
 * Decision tree panel - complete classification tree for a jurisdiction + entity type
 */
export interface LEICCADecisionTreePanel {
  id: string;
  country: string;
  countryName: string;
  panel: string;
  panelName: string;
  name: string;
  description: string;
  jurisdictionCodes: string[];  // e.g., ["GB", "UK", "ENW"]
  startNodeId: string;
  nodes: LEICCADecisionTreeNode[];
}

/**
 * Root structure of LEICCA decision trees data
 */
export interface LEICCADecisionTrees {
  version: string;
  lastUpdated: string;
  source: string;
  note: string;
  panels: LEICCADecisionTreePanel[];
}

/**
 * Single step in the decision path
 */
export interface DecisionPathStep {
  nodeId: string;
  nodeText: string;
  answer: string;
}

/**
 * Final classification result after traversing decision tree
 */
export interface ClassificationResult {
  panel: string;
  classification: string;
  category: string;
  description: string;
  success: boolean;
  decisionPath: DecisionPathStep[];
}
