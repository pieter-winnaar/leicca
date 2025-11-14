/**
 * DecisionTreeService Tests
 *
 * Validates LEICCA decision tree loading and traversal
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DecisionTreeService } from '../decision-tree';

describe('DecisionTreeService', () => {
  let service: DecisionTreeService;

  beforeEach(() => {
    service = new DecisionTreeService();
  });

  describe('Panel Loading', () => {
    it('should load all panels from LEICCA data', () => {
      const panels = service.getAllPanels();
      expect(panels).toBeDefined();
      expect(panels.length).toBeGreaterThan(0);
    });

    it('should load ENW_Corporation panel', () => {
      const panels = service.getAllPanels();
      const enwPanel = panels.find((p) => p.id === 'ENW_Corporation');

      expect(enwPanel).toBeDefined();
      expect(enwPanel?.country).toBe('ENW');
      expect(enwPanel?.countryName).toBe('England and Wales');
      expect(enwPanel?.panel).toBe('Corporation');
    });
  });

  describe('Jurisdiction Matching', () => {
    it('should find panel by GB jurisdiction code', () => {
      const panel = service.findPanelByJurisdiction('GB');
      expect(panel).toBeDefined();
      expect(panel?.jurisdictionCodes).toContain('GB');
    });

    it('should find panel by UK jurisdiction code', () => {
      const panel = service.findPanelByJurisdiction('UK');
      expect(panel).toBeDefined();
      expect(panel?.jurisdictionCodes).toContain('UK');
    });

    it('should find panel by ENW jurisdiction code', () => {
      const panel = service.findPanelByJurisdiction('ENW');
      expect(panel).toBeDefined();
      expect(panel?.jurisdictionCodes).toContain('ENW');
    });

    it('should handle case insensitive jurisdiction codes', () => {
      const panel1 = service.findPanelByJurisdiction('gb');
      const panel2 = service.findPanelByJurisdiction('GB');
      expect(panel1?.id).toBe(panel2?.id);
    });

    it('should return null for unknown jurisdiction', () => {
      const panel = service.findPanelByJurisdiction('UNKNOWN');
      expect(panel).toBeNull();
    });
  });

  describe('Panel and Node Access', () => {
    it('should get panel by ID', () => {
      const panel = service.getPanel('ENW_Corporation');
      expect(panel).toBeDefined();
      expect(panel?.id).toBe('ENW_Corporation');
    });

    it('should return null for unknown panel ID', () => {
      const panel = service.getPanel('UNKNOWN_PANEL');
      expect(panel).toBeNull();
    });

    it('should get start node', () => {
      const panel = service.getPanel('ENW_Corporation');
      expect(panel).toBeDefined();

      const startNode = service.getStartNode(panel!);
      expect(startNode).toBeDefined();
      expect(startNode?.id).toBe(panel!.startNodeId);
      expect(startNode?.nodeType).toBe('start');
    });

    it('should get node by ID', () => {
      const panel = service.getPanel('ENW_Corporation');
      expect(panel).toBeDefined();

      const node = service.getNode(panel!, 'ENW_JUR_ALL_4');
      expect(node).toBeDefined();
      expect(node?.id).toBe('ENW_JUR_ALL_4');
      expect(node?.nodeType).toBe('select');
    });

    it('should return null for unknown node ID', () => {
      const panel = service.getPanel('ENW_Corporation');
      expect(panel).toBeDefined();

      const node = service.getNode(panel!, 'UNKNOWN_NODE');
      expect(node).toBeNull();
    });
  });

  describe('Node Navigation', () => {
    it('should navigate from start node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const startNode = service.getStartNode(panel!);

      const nextNodeId = service.getNextNodeId(startNode!, 'continue');
      expect(nextNodeId).toBe('ENW_JUR_ALL_4');
    });

    it('should navigate from select node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const selectNode = service.getNode(panel!, 'ENW_JUR_ALL_4');

      const nextNodeId = service.getNextNodeId(selectNode!, 'company');
      expect(nextNodeId).toBe('ENW_CORP_COMP_1');
    });

    it('should navigate from question node with yes answer', () => {
      const panel = service.getPanel('ENW_Corporation');
      const questionNode = service.getNode(panel!, 'ENW_CORP_COMP_1');

      const nextNodeId = service.getNextNodeId(questionNode!, 'yes');
      expect(nextNodeId).toBe('ENW_CORP_COMP_2');
    });

    it('should navigate from question node with no answer', () => {
      const panel = service.getPanel('ENW_Corporation');
      const questionNode = service.getNode(panel!, 'ENW_CORP_COMP_1');

      const nextNodeId = service.getNextNodeId(questionNode!, 'no');
      expect(nextNodeId).toBe('ENW_CORP_COMP_9');
    });

    it('should return null for end node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const endNode = service.getNode(panel!, 'ENW_CORP_COMP_8');

      const nextNodeId = service.getNextNodeId(endNode!, 'any');
      expect(nextNodeId).toBeNull();
    });

    it('should return null for invalid select option', () => {
      const panel = service.getPanel('ENW_Corporation');
      const selectNode = service.getNode(panel!, 'ENW_JUR_ALL_4');

      const nextNodeId = service.getNextNodeId(selectNode!, 'invalid-option');
      expect(nextNodeId).toBeNull();
    });
  });

  describe('Classification Result Building', () => {
    it('should build classification result from successful end node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const endNode = service.getNode(panel!, 'ENW_CORP_COMP_8');

      const decisionPath = [
        { nodeId: 'start', nodeText: 'Start', answer: 'continue' },
        { nodeId: 'ENW_JUR_ALL_4', nodeText: 'Select industry', answer: 'company' },
        { nodeId: 'ENW_CORP_COMP_1', nodeText: 'Is English company?', answer: 'yes' },
      ];

      const result = service.buildClassificationResult(panel!, endNode!, decisionPath);

      expect(result.panel).toBe('ENW_Corporation');
      expect(result.classification).toBe('Company formed in England or Wales');
      expect(result.category).toBe('English or Welsh Company');
      expect(result.success).toBe(true);
      expect(result.decisionPath).toHaveLength(3);
    });

    it('should build classification result from failure end node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const endNode = service.getNode(panel!, 'ENW_CORP_COMP_9');

      const decisionPath = [
        { nodeId: 'ENW_CORP_COMP_1', nodeText: 'Is English company?', answer: 'no' },
      ];

      const result = service.buildClassificationResult(panel!, endNode!, decisionPath);

      expect(result.panel).toBe('ENW_Corporation');
      expect(result.classification).toBe('Not Classified');
      expect(result.category).toBe('Does Not Qualify');
      expect(result.success).toBe(false);
    });

    it('should throw error for non-end node', () => {
      const panel = service.getPanel('ENW_Corporation');
      const startNode = service.getStartNode(panel!);

      expect(() => {
        service.buildClassificationResult(panel!, startNode!, []);
      }).toThrow('Invalid end node');
    });
  });

  describe('Utility Methods', () => {
    it('should check if node exists', () => {
      const panel = service.getPanel('ENW_Corporation');
      expect(service.hasNode(panel!, 'start')).toBe(true);
      expect(service.hasNode(panel!, 'ENW_CORP_COMP_1')).toBe(true);
      expect(service.hasNode(panel!, 'UNKNOWN_NODE')).toBe(false);
    });

    it('should get node type counts', () => {
      const panel = service.getPanel('ENW_Corporation');
      const counts = service.getNodeTypeCounts(panel!);

      expect(counts.start).toBeGreaterThan(0);
      expect(counts.select).toBeGreaterThan(0);
      expect(counts.question).toBeGreaterThan(0);
      expect(counts.screenshot).toBeGreaterThan(0);
      expect(counts.end).toBeGreaterThan(0);
    });

    it('should get all end nodes', () => {
      const panel = service.getPanel('ENW_Corporation');
      const endNodes = service.getEndNodes(panel!);

      expect(endNodes.length).toBeGreaterThan(0);
      endNodes.forEach((node) => {
        expect(node.nodeType).toBe('end');
        expect(node.outcome).toBeDefined();
      });
    });
  });
});
