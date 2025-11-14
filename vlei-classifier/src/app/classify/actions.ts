/**
 * LEICCA vLEI Classifier - Classify Actions
 *
 * Server Actions for Basel CCR classification using LEICCA decision tree service
 */

'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { DecisionTreeService } from '@/services/decision-tree';
import type { LEICCADecisionTreeNode, DecisionPathStep } from '@/types/decision-tree';

const decisionTreeService = new DecisionTreeService();

/**
 * Classify a counterparty using LEICCA Basel CCR decision trees
 *
 * Handles all actions for decision tree traversal:
 * - loadPanels: Get all available classification panels
 * - matchJurisdiction: Auto-match panel from vLEI jurisdiction
 * - start: Begin classification with start node
 * - next: Navigate to next node based on answer
 * - complete: Build final classification result
 *
 * @param formData - Form data containing action type and classification data
 * @returns Node, classification result, or error
 */
export async function classifyCounterpartyAction(formData: FormData) {
  noStore();
  const action = formData.get('action') as string;

  try {
    if (action === 'loadPanels') {
      // Load all available panels
      const panels = decisionTreeService.getAllPanels();
      return {
        panels: panels.map((p) => ({
          id: p.id,
          name: p.name,
          country: p.countryName,
          description: p.description,
        })),
        error: null,
      };
    }

    if (action === 'matchJurisdiction') {
      // Try to auto-select panel based on vLEI jurisdiction
      const jurisdiction = formData.get('jurisdiction') as string;
      const panel = decisionTreeService.findPanelByJurisdiction(jurisdiction);

      return {
        panel: panel
          ? {
              id: panel.id,
              name: panel.name,
              matched: true,
            }
          : null,
        error: null,
      };
    }

    if (action === 'start') {
      // Start classification - return start node
      const panelId = formData.get('panelId') as string;
      const panel = decisionTreeService.getPanel(panelId);

      if (!panel) {
        return { error: 'Panel not found', node: null };
      }

      const startNode = decisionTreeService.getStartNode(panel);

      if (!startNode) {
        return { error: 'Start node not found', node: null };
      }

      // Get total question count for progress tracking
      const nodeCounts = decisionTreeService.getNodeTypeCounts(panel);
      const totalQuestions = nodeCounts.question || 0;

      return {
        node: startNode,
        totalNodes: panel.nodes.length,
        totalQuestions,
        error: null,
      };
    }

    if (action === 'next') {
      // Navigate to next node
      const panelId = formData.get('panelId') as string;
      const currentNodeId = formData.get('nodeId') as string;
      const answer = formData.get('answer') as string;

      const panel = decisionTreeService.getPanel(panelId);
      if (!panel) {
        return { error: 'Panel not found', node: null };
      }

      const currentNode = decisionTreeService.getNode(panel, currentNodeId);
      if (!currentNode) {
        return { error: 'Node not found', node: null };
      }

      const nextNodeId = decisionTreeService.getNextNodeId(currentNode, answer);
      if (!nextNodeId) {
        return { error: 'No next node found', node: null };
      }

      const nextNode = decisionTreeService.getNode(panel, nextNodeId);

      // Get total question count for progress tracking
      const nodeCounts = decisionTreeService.getNodeTypeCounts(panel);
      const totalQuestions = nodeCounts.question || 0;

      return {
        node: nextNode,
        totalNodes: panel.nodes.length,
        totalQuestions,
        error: null,
      };
    }

    if (action === 'complete') {
      // Complete classification
      const panelId = formData.get('panelId') as string;
      const endNodeId = formData.get('endNodeId') as string;
      const decisionPathJson = formData.get('decisionPath') as string;
      const screenshotHash = formData.get('screenshotHash') as string | null;
      const screenshotFilename = formData.get('screenshotFilename') as string | null;

      const panel = decisionTreeService.getPanel(panelId);
      if (!panel) {
        return { error: 'Panel not found', classification: null };
      }

      const endNode = decisionTreeService.getNode(panel, endNodeId);
      if (!endNode || endNode.nodeType !== 'end') {
        return { error: 'Invalid end node', classification: null };
      }

      const decisionPath: DecisionPathStep[] = JSON.parse(decisionPathJson);

      const classification = decisionTreeService.buildClassificationResult(
        panel,
        endNode,
        decisionPath
      );

      // Add screenshot info to classification if available
      if (screenshotHash && screenshotFilename) {
        (classification as any).screenshot = {
          filename: screenshotFilename,
          hash: screenshotHash,
        };
      }

      return {
        classification,
        error: null,
      };
    }

    return { error: 'Invalid action', node: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Classification failed',
      node: null,
    };
  }
}
