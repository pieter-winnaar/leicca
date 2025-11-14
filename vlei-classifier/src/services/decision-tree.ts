/**
 * LEICCA Decision Tree Service
 *
 * Handles loading and traversal of LEICCA decision trees for Basel CCR classification.
 * Based on real LEICCA data structure from the LEICCA team.
 */

import type {
  LEICCADecisionTreePanel,
  LEICCADecisionTreeNode,
  ClassificationResult,
  DecisionPathStep,
} from '@/types/decision-tree';
import leiccaData from '../../docs/01-RESEARCH/leicca-decision-trees.json';

/**
 * Service for managing LEICCA decision tree classification
 */
export class DecisionTreeService {
  private panels: LEICCADecisionTreePanel[];

  constructor() {
    // Load LEICCA panels from JSON data
    this.panels = leiccaData.panels as LEICCADecisionTreePanel[];
  }

  /**
   * Get all available classification panels
   *
   * @returns Array of all decision tree panels
   */
  getAllPanels(): LEICCADecisionTreePanel[] {
    return this.panels;
  }

  /**
   * Find panel by jurisdiction code
   *
   * Matches jurisdiction codes from vLEI verification (e.g., "GB", "UK", "ENW")
   * to available classification panels.
   *
   * @param jurisdictionCode - ISO country code or jurisdiction identifier
   * @returns Matching panel or null if not found
   */
  findPanelByJurisdiction(jurisdictionCode: string): LEICCADecisionTreePanel | null {
    const normalizedCode = jurisdictionCode.toUpperCase();
    return (
      this.panels.find((panel) => panel.jurisdictionCodes.includes(normalizedCode)) || null
    );
  }

  /**
   * Get panel by ID
   *
   * @param panelId - Unique panel identifier (e.g., "ENW_Corporation")
   * @returns Panel or null if not found
   */
  getPanel(panelId: string): LEICCADecisionTreePanel | null {
    return this.panels.find((p) => p.id === panelId) || null;
  }

  /**
   * Get a specific node from a panel
   *
   * @param panel - Decision tree panel
   * @param nodeId - Node identifier
   * @returns Node or null if not found
   */
  getNode(panel: LEICCADecisionTreePanel, nodeId: string): LEICCADecisionTreeNode | null {
    return panel.nodes.find((n) => n.id === nodeId) || null;
  }

  /**
   * Get the start node for a panel
   *
   * @param panel - Decision tree panel
   * @returns Start node or null if not found
   */
  getStartNode(panel: LEICCADecisionTreePanel): LEICCADecisionTreeNode | null {
    return this.getNode(panel, panel.startNodeId);
  }

  /**
   * Navigate from current node based on user's answer
   *
   * Returns the next node ID to navigate to, or null if at terminal node.
   * Handles all LEICCA node types:
   * - question: Uses yesTarget/noTarget based on yes/no answer
   * - select: Matches selectOptions by option ID
   * - start/screenshot: Returns continueTarget
   * - end: Returns null (terminal)
   *
   * @param node - Current node
   * @param answer - User's answer (varies by node type)
   * @returns Next node ID or null if terminal
   */
  getNextNodeId(node: LEICCADecisionTreeNode, answer: string): string | null {
    switch (node.nodeType) {
      case 'question':
        // Binary yes/no question
        return answer === 'yes' ? node.yesTarget || null : node.noTarget || null;

      case 'select':
        // Dropdown selection - match by option ID
        const option = node.selectOptions?.find((opt) => opt.id === answer);
        return option?.nextNodeId || null;

      case 'start':
      case 'screenshot':
        // Continue to next node
        return node.continueTarget || null;

      case 'end':
        // Terminal node - no next node
        return null;

      default:
        return null;
    }
  }

  /**
   * Build classification result from decision path
   *
   * Constructs the final ClassificationResult from the end node and
   * the path taken through the decision tree.
   *
   * @param panel - Decision tree panel
   * @param endNode - Terminal node with classification outcome
   * @param decisionPath - Path taken through the tree
   * @returns Classification result
   * @throws Error if endNode is invalid or missing outcome
   */
  buildClassificationResult(
    panel: LEICCADecisionTreePanel,
    endNode: LEICCADecisionTreeNode,
    decisionPath: DecisionPathStep[]
  ): ClassificationResult {
    if (endNode.nodeType !== 'end' || !endNode.outcome) {
      throw new Error(
        `Invalid end node: ${endNode.id}. Must be nodeType 'end' with outcome defined.`
      );
    }

    return {
      panel: panel.id,
      classification: endNode.outcome.classification,
      category: endNode.outcome.category,
      description: endNode.outcome.description,
      success: endNode.outcome.success,
      decisionPath,
    };
  }

  /**
   * Validate that a node exists in a panel
   *
   * @param panel - Decision tree panel
   * @param nodeId - Node identifier to check
   * @returns true if node exists
   */
  hasNode(panel: LEICCADecisionTreePanel, nodeId: string): boolean {
    return panel.nodes.some((n) => n.id === nodeId);
  }

  /**
   * Get node counts by type for a panel
   *
   * Useful for progress tracking and UI display.
   *
   * @param panel - Decision tree panel
   * @returns Object with counts by node type
   */
  getNodeTypeCounts(panel: LEICCADecisionTreePanel): Record<string, number> {
    const counts: Record<string, number> = {
      start: 0,
      select: 0,
      question: 0,
      screenshot: 0,
      end: 0,
    };

    panel.nodes.forEach((node) => {
      counts[node.nodeType]++;
    });

    return counts;
  }

  /**
   * Get all possible end nodes (outcomes) for a panel
   *
   * @param panel - Decision tree panel
   * @returns Array of end nodes with outcomes
   */
  getEndNodes(panel: LEICCADecisionTreePanel): LEICCADecisionTreeNode[] {
    return panel.nodes.filter((n) => n.nodeType === 'end');
  }

  /**
   * Get count of question nodes only (for progress tracking)
   *
   * @param panel - Decision tree panel
   * @returns Number of question nodes
   */
  getQuestionCount(panel: LEICCADecisionTreePanel): number {
    const counts = this.getNodeTypeCounts(panel);
    return counts.question || 0;
  }
}
