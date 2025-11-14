import * as React from 'react';
import type { ComponentMetadata } from '../types/component.types';
import { FlowDiagram } from '../components/flow-diagram';
import type { FlowNode, FlowEdge } from '../components/flow-diagram';
import { Slider } from '../components/slider';

// Example 1: UTXO Flow Tracking
const utxoNodes: FlowNode[] = [
  {
    id: 'input1',
    label: '1000 sats',
    timestamp: 1000,
    value: 1000,
    status: 'confirmed',
    metadata: { txid: 'abc123...', vout: 0 }
  },
  {
    id: 'input2',
    label: '500 sats',
    timestamp: 1000,
    value: 500,
    status: 'confirmed',
    metadata: { txid: 'def456...', vout: 1 }
  },
  {
    id: 'tx1',
    label: 'Payment TX',
    timestamp: 2000,
    status: 'pending',
    metadata: { txid: 'ghi789...', fee: 10 }
  },
  {
    id: 'output1',
    label: '700 sats',
    timestamp: 2000,
    value: 700,
    status: 'pending',
    metadata: { recipient: 'Alice' }
  },
  {
    id: 'output2',
    label: '790 sats',
    timestamp: 2000,
    value: 790,
    status: 'pending',
    metadata: { recipient: 'Change' }
  }
];

const utxoEdges: FlowEdge[] = [
  { source: 'input1', target: 'tx1', value: 1000, label: '1000 →' },
  { source: 'input2', target: 'tx1', value: 500, label: '500 →' },
  { source: 'tx1', target: 'output1', value: 700, label: '→ 700' },
  { source: 'tx1', target: 'output2', value: 790, label: '→ 790' }
];

// Example 2: Decision Tree
const decisionNodes: FlowNode[] = [
  {
    id: 'q1',
    label: 'Is it a bank?',
    status: 'confirmed', // Part of chosen path
    metadata: { type: 'question' }
  },
  {
    id: 'yes1',
    label: 'Yes',
    status: 'confirmed',
    metadata: { type: 'answer' }
  },
  {
    id: 'no1',
    label: 'No',
    metadata: { type: 'answer' }
  },
  {
    id: 'q2',
    label: 'Regulated?',
    status: 'confirmed', // Part of the chosen path
    metadata: { type: 'question' }
  },
  {
    id: 'q3',
    label: 'Corporate entity?',
    metadata: { type: 'question' } // Not chosen, stays gray
  },
  {
    id: 'outcome1',
    label: '20% Risk Weight',
    value: 20,
    metadata: { type: 'outcome', citation: 'Basel III CRR Article 120(2)' }
  },
  {
    id: 'outcome2',
    label: '100% Risk Weight',
    value: 100,
    status: 'complete',
    metadata: { type: 'outcome', citation: 'Basel III CRR Article 120(3)' }
  },
  {
    id: 'outcome3',
    label: '0% Risk Weight',
    value: 0,
    metadata: { type: 'outcome', citation: 'Basel III CRR Article 119' }
  }
];

const decisionEdges: FlowEdge[] = [
  { source: 'q1', target: 'yes1', label: 'Yes', value: 10 },
  { source: 'q1', target: 'no1', label: 'No', value: 10 },
  { source: 'yes1', target: 'q2', value: 10 },
  { source: 'no1', target: 'q3', value: 10 },
  { source: 'q2', target: 'outcome1', label: 'Yes', value: 20 },
  { source: 'q2', target: 'outcome2', label: 'No', value: 100 },
  { source: 'q3', target: 'outcome3', label: 'Yes', value: 1 } // Thin for 0% weight
];

// Example 3: Complex UTXO Flow - Multiple Consolidation & Splitting
// HIGHLIGHTED PATH: in1 + in3 → tx1 → out1a → tx2 → out2b + out2c → tx3 → final1
const complexUtxoNodes: FlowNode[] = [
  // 10 INITIAL INPUTS
  { id: 'in1', label: '2000', value: 2000, status: 'confirmed', metadata: { from: 'Wallet A' } },
  { id: 'in2', label: '1800', value: 1800, metadata: { from: 'Wallet B' } },
  { id: 'in3', label: '1500', value: 1500, status: 'confirmed', metadata: { from: 'Wallet C' } },
  { id: 'in4', label: '1200', value: 1200, metadata: { from: 'Wallet D' } },
  { id: 'in5', label: '1000', value: 1000, metadata: { from: 'Wallet E' } },
  { id: 'in6', label: '900', value: 900, metadata: { from: 'Wallet F' } },
  { id: 'in7', label: '800', value: 800, metadata: { from: 'Wallet G' } },
  { id: 'in8', label: '700', value: 700, metadata: { from: 'Wallet H' } },

  // FIRST CONSOLIDATION LAYER (8 inputs → 2 txs)
  { id: 'tx1', label: 'Consolidate A', status: 'confirmed', metadata: { fee: 50 } },
  { id: 'tx1b', label: 'Consolidate B', metadata: { fee: 45 } },

  // FIRST SPLIT (2 txs → 5 outputs)
  { id: 'out1a', label: '2500', value: 2500, status: 'confirmed', metadata: { recipient: 'Alice' } },
  { id: 'out1b', label: '900', value: 900, metadata: { recipient: 'Bob' } },
  { id: 'out1c', label: '1800', value: 1800, metadata: { recipient: 'Carol' } },
  { id: 'out1d', label: '1500', value: 1500, metadata: { recipient: 'Dave' } },
  { id: 'out1e', label: '1200', value: 1200, metadata: { recipient: 'Eve' } },

  // SECOND CONSOLIDATION (3 outputs → 1 tx)
  { id: 'tx2', label: 'Merge Payment', status: 'confirmed', metadata: { fee: 40 } },

  // SECOND SPLIT (1 tx → 8 outputs - MORE OUTPUTS!)
  { id: 'out2a', label: '1000', value: 1000, metadata: { recipient: 'Merchant 1' } },
  { id: 'out2b', label: '800', value: 800, metadata: { recipient: 'Merchant 2' } },
  { id: 'out2c', label: '600', value: 600, metadata: { recipient: 'Merchant 3' } },
  { id: 'out2d', label: '500', value: 500, metadata: { recipient: 'Merchant 4' } },
  { id: 'out2e', label: '400', value: 400, status: 'confirmed', metadata: { recipient: 'Merchant 5' } },
  { id: 'out2f', label: '300', value: 300, status: 'confirmed', metadata: { recipient: 'Merchant 6' } },
  { id: 'out2g', label: '200', value: 200, metadata: { recipient: 'Merchant 7' } },
  { id: 'out2h', label: '60', value: 60, metadata: { recipient: 'Fee Pool' } },

  // GRAY BRANCH (was highlighted): out2b + out2c → tx3
  { id: 'tx3', label: 'Settlement', metadata: { fee: 30 } },
  { id: 'final1', label: '1200', value: 1200, metadata: { recipient: 'Cold Storage' } },
  { id: 'final2', label: '150', value: 150, metadata: { recipient: 'Hot Wallet' } },
  { id: 'final3', label: '20', value: 20, metadata: { recipient: 'Dust' } },

  // GRAY BRANCH 1: out2a + out2d → tx4 → outputs
  { id: 'tx4', label: 'Branch Consolidate', metadata: { fee: 25 } },
  { id: 'branch1_out1', label: '800', value: 800, metadata: { recipient: 'Exchange A' } },
  { id: 'branch1_out2', label: '500', value: 500, metadata: { recipient: 'Exchange B' } },
  { id: 'branch1_out3', label: '175', value: 175, metadata: { recipient: 'Change' } },

  // HIGHLIGHTED PATH: out2e + out2f → tx5 → split → consolidate again → final 500
  { id: 'tx5', label: 'Branch Merge', status: 'confirmed', metadata: { fee: 20 } },
  { id: 'branch2_mid1', label: '400', value: 400, status: 'confirmed', metadata: { recipient: 'Processor A' } },
  { id: 'branch2_mid2', label: '280', value: 280, status: 'confirmed', metadata: { recipient: 'Processor B' } },
  { id: 'tx6', label: 'Branch Final', status: 'confirmed', metadata: { fee: 15 } },
  { id: 'branch2_final1', label: '500', value: 500, status: 'complete', metadata: { recipient: 'Vault' } },
  { id: 'branch2_final2', label: '165', value: 165, metadata: { recipient: 'Reserve' } },
];

const complexUtxoEdges: FlowEdge[] = [
  // 8 inputs → 2 consolidation txs
  { source: 'in1', target: 'tx1', value: 2000 },
  { source: 'in3', target: 'tx1', value: 1500 },
  { source: 'in2', target: 'tx1b', value: 1800 },
  { source: 'in4', target: 'tx1b', value: 1200 },
  { source: 'in5', target: 'tx1b', value: 1000 },
  { source: 'in6', target: 'tx1b', value: 900 },
  { source: 'in7', target: 'tx1b', value: 800 },
  { source: 'in8', target: 'tx1b', value: 700 },

  // 2 txs → 5 outputs (split)
  { source: 'tx1', target: 'out1a', value: 2500 },
  { source: 'tx1', target: 'out1b', value: 900 },
  { source: 'tx1b', target: 'out1c', value: 1800 },
  { source: 'tx1b', target: 'out1d', value: 1500 },
  { source: 'tx1b', target: 'out1e', value: 1200 },

  // 3 outputs → 1 tx (consolidate again)
  { source: 'out1a', target: 'tx2', value: 2500 },
  { source: 'out1c', target: 'tx2', value: 1800 },
  { source: 'out1d', target: 'tx2', value: 1500 },

  // tx2 → 8 outputs (MORE outputs!)
  { source: 'tx2', target: 'out2a', value: 1000 },
  { source: 'tx2', target: 'out2b', value: 800 },
  { source: 'tx2', target: 'out2c', value: 600 },
  { source: 'tx2', target: 'out2d', value: 500 },
  { source: 'tx2', target: 'out2e', value: 400 },
  { source: 'tx2', target: 'out2f', value: 300 },
  { source: 'tx2', target: 'out2g', value: 200 },
  { source: 'tx2', target: 'out2h', value: 60 },

  // HIGHLIGHTED PATH: out2b + out2c → tx3 → finals
  { source: 'out2b', target: 'tx3', value: 800 },
  { source: 'out2c', target: 'tx3', value: 600 },
  { source: 'tx3', target: 'final1', value: 1200 },
  { source: 'tx3', target: 'final2', value: 150 },
  { source: 'tx3', target: 'final3', value: 20 },

  // GRAY BRANCH 1: out2a + out2d → tx4 → 3 outputs
  { source: 'out2a', target: 'tx4', value: 1000 },
  { source: 'out2d', target: 'tx4', value: 500 },
  { source: 'tx4', target: 'branch1_out1', value: 800 },
  { source: 'tx4', target: 'branch1_out2', value: 500 },
  { source: 'tx4', target: 'branch1_out3', value: 175 },

  // GRAY BRANCH 2: out2e + out2f → tx5 → split → consolidate → finals
  { source: 'out2e', target: 'tx5', value: 400 },
  { source: 'out2f', target: 'tx5', value: 300 },
  { source: 'tx5', target: 'branch2_mid1', value: 400 },
  { source: 'tx5', target: 'branch2_mid2', value: 280 },
  { source: 'branch2_mid1', target: 'tx6', value: 400 },
  { source: 'branch2_mid2', target: 'tx6', value: 280 },
  { source: 'tx6', target: 'branch2_final1', value: 500 },
  { source: 'tx6', target: 'branch2_final2', value: 165 },
];

// Example 4: Audit Trail
const auditNodes: FlowNode[] = [
  {
    id: 'upload',
    label: 'Document Upload',
    timestamp: 1000,
    status: 'complete',
    metadata: { user: 'user@example.com', size: '2.5 MB' }
  },
  {
    id: 'hash',
    label: 'SHA-256 Hash',
    timestamp: 2000,
    status: 'complete',
    metadata: { hash: '0x1234...' }
  },
  {
    id: 'sign',
    label: 'Digital Signature',
    timestamp: 3000,
    status: 'complete',
    metadata: { algorithm: 'ED25519' }
  },
  {
    id: 'verify',
    label: 'Signature Verify',
    timestamp: 4000,
    status: 'complete',
    metadata: { result: 'Valid' }
  },
  {
    id: 'anchor',
    label: 'Blockchain Anchor',
    timestamp: 5000,
    status: 'pending',
    metadata: { txid: 'abc123...' }
  },
  {
    id: 'confirm',
    label: 'Block Confirmation',
    timestamp: 6000,
    status: 'pending',
    metadata: { confirmations: 2 }
  }
];

const auditEdges: FlowEdge[] = [
  { source: 'upload', target: 'hash', animated: false },
  { source: 'hash', target: 'sign', animated: false },
  { source: 'sign', target: 'verify', animated: false },
  { source: 'verify', target: 'anchor', animated: true },
  { source: 'anchor', target: 'confirm', animated: true }
];

// Example 4: Timechain Block Flow
const timechainNodes: FlowNode[] = [
  {
    id: 'block800000',
    label: 'Block 800,000',
    timestamp: 1000,
    value: 250,
    status: 'confirmed',
    metadata: { height: 800000, txCount: 250 }
  },
  {
    id: 'block800001',
    label: 'Block 800,001',
    timestamp: 2000,
    value: 180,
    status: 'confirmed',
    metadata: { height: 800001, txCount: 180 }
  },
  {
    id: 'block800002',
    label: 'Block 800,002',
    timestamp: 3000,
    value: 320,
    status: 'confirmed',
    metadata: { height: 800002, txCount: 320 }
  },
  {
    id: 'block800003',
    label: 'Block 800,003',
    timestamp: 4000,
    value: 150,
    status: 'pending',
    metadata: { height: 800003, txCount: 150 }
  }
];

const timechainEdges: FlowEdge[] = [
  { source: 'block800000', target: 'block800001', value: 250 },
  { source: 'block800001', target: 'block800002', value: 180 },
  { source: 'block800002', target: 'block800003', value: 320, animated: true }
];

export const flowDiagramMetadata: ComponentMetadata = {
  id: 'flow-diagram',
  name: 'FlowDiagram',
  description: 'Generic flow visualization component with time-travel scrubbing. Supports UTXO tracking, decision trees, audit trails, and timechain visualization.',
  category: 'data-display',
  variants: ['tree', 'sankey', 'dag'],
  preview: (
    <FlowDiagram
      nodes={utxoNodes}
      edges={utxoEdges}
      variant="tree"
      showControls={true}
      showBackground={true}
      className="h-[400px]"
    />
  ),
  props: [
    {
      name: 'nodes',
      type: 'FlowNode[]',
      description: 'Array of flow nodes with id, label, optional timestamp, value, status',
      required: true
    },
    {
      name: 'edges',
      type: 'FlowEdge[]',
      description: 'Array of connections between nodes (source, target, optional label, value)',
      required: true
    },
    {
      name: 'currentTime',
      type: 'number',
      description: 'Current timestamp for time-travel filtering. Only nodes with timestamp <= currentTime are shown',
      required: false,
      defaultValue: 'Infinity'
    },
    {
      name: 'onNodeClick',
      type: '(node: FlowNode) => void',
      description: 'Callback when a node is clicked',
      required: false
    },
    {
      name: 'variant',
      type: '"tree" | "sankey" | "dag"',
      description: 'Layout algorithm for nodes',
      required: false,
      defaultValue: '"tree"'
    },
    {
      name: 'showMiniMap',
      type: 'boolean',
      description: 'Show minimap navigation',
      required: false,
      defaultValue: 'false'
    },
    {
      name: 'showControls',
      type: 'boolean',
      description: 'Show zoom/pan controls',
      required: false,
      defaultValue: 'true'
    },
    {
      name: 'showBackground',
      type: 'boolean',
      description: 'Show dotted background grid',
      required: false,
      defaultValue: 'true'
    },
    {
      name: 'fitView',
      type: 'boolean',
      description: 'Auto-fit all nodes in viewport',
      required: false,
      defaultValue: 'true'
    }
  ],
  examples: [
    {
      title: 'UTXO Flow Tracking',
      description: 'Visualize Bitcoin UTXO inputs and outputs flowing through transactions',
      code: `const utxoNodes: FlowNode[] = [
  { id: 'input1', label: '1000 sats', timestamp: 1000, value: 1000, status: 'confirmed', metadata: { txid: 'abc123...', vout: 0 } },
  { id: 'input2', label: '500 sats', timestamp: 1000, value: 500, status: 'confirmed', metadata: { txid: 'def456...', vout: 1 } },
  { id: 'tx1', label: 'Payment TX', timestamp: 2000, status: 'pending', metadata: { txid: 'ghi789...', fee: 10 } },
  { id: 'output1', label: '700 sats', timestamp: 2000, value: 700, status: 'pending', metadata: { recipient: 'Alice' } },
  { id: 'output2', label: '790 sats', timestamp: 2000, value: 790, status: 'pending', metadata: { recipient: 'Change' } }
]

const utxoEdges: FlowEdge[] = [
  { source: 'input1', target: 'tx1', value: 1000, label: '1000 →' },
  { source: 'input2', target: 'tx1', value: 500, label: '500 →' },
  { source: 'tx1', target: 'output1', value: 700, label: '→ 700' },
  { source: 'tx1', target: 'output2', value: 790, label: '→ 790' }
]

<FlowDiagram
  nodes={utxoNodes}
  edges={utxoEdges}
  variant="tree"
  onNodeClick={(node) => console.log('Clicked:', node)}
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={utxoNodes}
          edges={utxoEdges}
          variant="tree"
          className="h-[350px]"
        />
      )
    },
    {
      title: 'Complex UTXO Flow - Splitting & Consolidation',
      description: 'Multi-step UTXO flow showing consolidation, splitting, and spending patterns. Highlights one complete payment path from input to merchant.',
      code: `// Highlighted path: input1 → tx1 → output1a → tx2 → output2a
const complexUtxoNodes: FlowNode[] = [
  // HIGHLIGHTED - input1 only
  { id: 'input1', label: '5000 sats', value: 5000, status: 'confirmed', metadata: { txid: 'tx1...', from: 'Wallet A' } },
  { id: 'input2', label: '3000 sats', value: 3000, metadata: { txid: 'tx2...', from: 'Wallet B' } },

  // HIGHLIGHTED - consolidation tx
  { id: 'tx1', label: 'Consolidate', status: 'confirmed', metadata: { txid: 'tx3...', fee: 100 } },

  // HIGHLIGHTED - Alice payment output
  { id: 'output1a', label: '4000 sats', value: 4000, status: 'confirmed', metadata: { recipient: 'Alice' } },
  { id: 'output1b', label: '3900 sats', value: 3900, metadata: { recipient: 'Change' } },

  // HIGHLIGHTED - Alice spends
  { id: 'tx2', label: 'Alice Payment', status: 'confirmed', metadata: { txid: 'tx4...', fee: 50 } },
  { id: 'output2a', label: '2500 sats', value: 2500, status: 'confirmed', metadata: { recipient: 'Merchant' } },
  { id: 'output2b', label: '1450 sats', value: 1450, metadata: { recipient: 'Alice Change' } },

  // NOT highlighted - other branches
  { id: 'tx3', label: 'Change Spend', metadata: { txid: 'tx5...', fee: 75 } },
  { id: 'output3a', label: '2000 sats', value: 2000, metadata: { recipient: 'Bob' } },
  { id: 'output3b', label: '1825 sats', value: 1825, metadata: { recipient: 'Final Change' } },
  { id: 'tx4', label: 'Merchant Collect', metadata: { txid: 'tx6...', fee: 60 } },
  { id: 'output4', label: '2440 sats', value: 2440, metadata: { recipient: 'Merchant Wallet' } },
]

const complexUtxoEdges: FlowEdge[] = [
  { source: 'input1', target: 'tx1', value: 5000 },
  { source: 'input2', target: 'tx1', value: 3000 },
  { source: 'tx1', target: 'output1a', value: 4000 },
  { source: 'tx1', target: 'output1b', value: 3900 },
  { source: 'output1a', target: 'tx2', value: 4000 },
  { source: 'tx2', target: 'output2a', value: 2500 },
  { source: 'tx2', target: 'output2b', value: 1450 },
  { source: 'output1b', target: 'tx3', value: 3900 },
  { source: 'tx3', target: 'output3a', value: 2000 },
  { source: 'tx3', target: 'output3b', value: 1825 },
  { source: 'output2a', target: 'tx4', value: 2500 },
  { source: 'tx4', target: 'output4', value: 2440 },
]

<FlowDiagram
  nodes={complexUtxoNodes}
  edges={complexUtxoEdges}
  variant="sankey"
  className="h-[400px]"
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={complexUtxoNodes}
          edges={complexUtxoEdges}
          variant="sankey"
          className="h-[400px]"
        />
      )
    },
    {
      title: 'Decision Tree',
      description: 'Interactive decision flow for Basel CCR risk classification',
      code: `const decisionNodes: FlowNode[] = [
  { id: 'q1', label: 'Is it a bank?', status: 'confirmed', metadata: { type: 'question' } },
  { id: 'yes1', label: 'Yes', status: 'confirmed', metadata: { type: 'answer' } },
  { id: 'no1', label: 'No', metadata: { type: 'answer' } },
  { id: 'q2', label: 'Regulated?', status: 'confirmed', metadata: { type: 'question' } },
  { id: 'q3', label: 'Corporate entity?', metadata: { type: 'question' } },
  { id: 'outcome1', label: '20% Risk Weight', value: 20 },
  { id: 'outcome2', label: '100% Risk Weight', value: 100, status: 'complete' },
  { id: 'outcome3', label: '0% Risk Weight', value: 0 }
]

const decisionEdges: FlowEdge[] = [
  { source: 'q1', target: 'yes1', label: 'Yes', value: 10 },
  { source: 'q1', target: 'no1', label: 'No', value: 10 },
  { source: 'yes1', target: 'q2', value: 10 },
  { source: 'no1', target: 'q3', value: 10 },
  { source: 'q2', target: 'outcome1', label: 'Yes', value: 20 },
  { source: 'q2', target: 'outcome2', label: 'No', value: 100 },
  { source: 'q3', target: 'outcome3', label: 'Yes', value: 1 }
]

<FlowDiagram
  nodes={decisionNodes}
  edges={decisionEdges}
  variant="tree"
  showBackground={false}
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={decisionNodes}
          edges={decisionEdges}
          variant="tree"
          showBackground={false}
          className="h-[350px]"
        />
      )
    },
    {
      title: 'Audit Trail',
      description: 'Immutable event log showing document verification flow',
      code: `const auditNodes: FlowNode[] = [
  { id: 'upload', label: 'Document Upload', status: 'complete', timestamp: 1000 },
  { id: 'hash', label: 'SHA-256 Hash', status: 'complete', timestamp: 2000 },
  { id: 'sign', label: 'Digital Signature', status: 'complete', timestamp: 3000 },
  { id: 'verify', label: 'Signature Verify', status: 'complete', timestamp: 4000 },
  { id: 'anchor', label: 'Blockchain Anchor', status: 'pending', timestamp: 5000 }
]

const auditEdges: FlowEdge[] = [
  { source: 'upload', target: 'hash' },
  { source: 'hash', target: 'sign' },
  { source: 'sign', target: 'verify' },
  { source: 'verify', target: 'anchor', animated: true }
]

<FlowDiagram
  nodes={auditNodes}
  edges={auditEdges}
  variant="tree"
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={auditNodes}
          edges={auditEdges}
          variant="tree"
          className="h-[350px]"
        />
      )
    },
    {
      title: 'Time-Travel Scrubbing',
      description: 'Filter nodes by timestamp to view state at different points in time',
      code: `const [currentTime, setCurrentTime] = useState(3000)

const nodes: FlowNode[] = [
  { id: 'step1', label: 'Step 1', timestamp: 1000, status: 'complete' },
  { id: 'step2', label: 'Step 2', timestamp: 2000, status: 'complete' },
  { id: 'step3', label: 'Step 3', timestamp: 3000, status: 'complete' },
  { id: 'step4', label: 'Step 4', timestamp: 4000, status: 'pending' }
]

<div className="space-y-4">
  <div className="flex items-center gap-4">
    <Label>Time: {currentTime}ms</Label>
    <Slider
      min={0}
      max={6000}
      step={100}
      value={[currentTime]}
      onValueChange={([v]) => setCurrentTime(v)}
      className="flex-1"
    />
  </div>
  <FlowDiagram
    nodes={nodes}
    edges={edges}
    currentTime={currentTime}
  />
</div>`,
      language: 'tsx',
      preview: (() => {
        const TimeTravelDemo = () => {
          const [currentTime, setCurrentTime] = React.useState(3000)
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Time: {currentTime}ms</span>
                <Slider
                  min={0}
                  max={6000}
                  step={100}
                  value={[currentTime]}
                  onValueChange={(values) => {
                    const v = values[0]
                    if (v !== undefined && !isNaN(v)) {
                      setCurrentTime(v)
                    }
                  }}
                  className="flex-1"
                />
              </div>
              <FlowDiagram
                nodes={auditNodes}
                edges={auditEdges}
                currentTime={currentTime}
                variant="tree"
                className="h-[300px]"
              />
            </div>
          )
        }
        return <TimeTravelDemo />
      })()
    },
    {
      title: 'Timechain (Blockchain) Flow',
      description: 'Visualize block confirmations over time',
      code: `const timechainNodes: FlowNode[] = [
  { id: 'block800000', label: 'Block 800,000', value: 250, status: 'confirmed', timestamp: 1000 },
  { id: 'block800001', label: 'Block 800,001', value: 180, status: 'confirmed', timestamp: 2000 },
  { id: 'block800002', label: 'Block 800,002', value: 320, status: 'confirmed', timestamp: 3000 },
  { id: 'block800003', label: 'Block 800,003', value: 150, status: 'pending', timestamp: 4000 }
]

const timechainEdges: FlowEdge[] = [
  { source: 'block800000', target: 'block800001', value: 250 },
  { source: 'block800001', target: 'block800002', value: 180 },
  { source: 'block800002', target: 'block800003', value: 320, animated: true }
]

<FlowDiagram
  nodes={timechainNodes}
  edges={timechainEdges}
  variant="tree"
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={timechainNodes}
          edges={timechainEdges}
          variant="tree"
          className="h-[350px]"
        />
      )
    },
    {
      title: 'Complex Basel CCR Risk Classification',
      description: 'Multi-step decision tree for counterparty credit risk weighting with full Basel III compliance',
      code: `// Complex real-world Basel CCR classification
// Blue path ONLY: Start → Central Govt? No → Bank? No → Corporate? Yes → SME? No → 100% RW
const baselNodes: FlowNode[] = [
  { id: 'start', label: 'Counterparty', status: 'confirmed', value: 100, metadata: { exposure: '$1M', type: 'Assessment Start' } },

  // CHOSEN PATH - all confirmed
  { id: 'q1', label: 'Central Govt?', status: 'confirmed', metadata: { article: 'CRR Art 114', answer: 'No - Corporate Entity' } },
  { id: 'q4', label: 'Bank/Investment Firm?', status: 'confirmed', metadata: { article: 'CRR Art 120', answer: 'No - Corporate' } },
  { id: 'q7', label: 'Corporate Entity?', status: 'confirmed', metadata: { article: 'CRR Art 122', answer: 'Yes - Corporation' } },
  { id: 'q8', label: 'SME?', status: 'confirmed', metadata: { article: 'CRR Art 501', answer: 'No - Large Corp' } },
  { id: 'rw100', label: '100% RW', value: 100, status: 'complete', metadata: { citation: 'CRR Art 122', exposure: '$1M', result: 'FINAL CLASSIFICATION' } },

  // NOT CHOSEN - all gray (no status)
  { id: 'q2', label: 'OECD Member?', metadata: { article: 'CRR Art 114(2)' } },
  { id: 'q3', label: 'Credit Quality?', metadata: { article: 'CRR Art 114(4)' } },
  { id: 'q5', label: 'Credit Rating?', metadata: { article: 'CRR Art 120(2)' } },
  { id: 'q6', label: 'Maturity > 3mo?', metadata: { article: 'CRR Art 120(3)' } },
  { id: 'rw0', label: '0% RW', value: 0, metadata: { citation: 'CRR Art 114(2)', exposure: '$0' } },
  { id: 'rw20', label: '20% RW', value: 20, metadata: { citation: 'CRR Art 120(2)', exposure: '$200K' } },
  { id: 'rw50', label: '50% RW', value: 50, metadata: { citation: 'CRR Art 120(3)', exposure: '$500K' } },
  { id: 'rw75', label: '75% RW', value: 75, metadata: { citation: 'CRR Art 501', exposure: '$750K' } },
  { id: 'rw150', label: '150% RW', value: 150, metadata: { citation: 'CRR Art 128', exposure: '$1.5M' } },
]

const baselEdges: FlowEdge[] = [
  // CHOSEN PATH - will be blue
  { source: 'start', target: 'q1', value: 100 },
  { source: 'q1', target: 'q4', label: 'No', value: 70 },
  { source: 'q4', target: 'q7', label: 'No', value: 20 },
  { source: 'q7', target: 'q8', label: 'Yes', value: 15 },
  { source: 'q8', target: 'rw100', label: 'No', value: 5 },

  // NOT CHOSEN - will be gray
  { source: 'q1', target: 'q2', label: 'Yes', value: 30 },
  { source: 'q2', target: 'rw0', label: 'Yes', value: 30 },
  { source: 'q2', target: 'q3', label: 'No', value: 0 },
  { source: 'q4', target: 'q5', label: 'Yes', value: 50 },
  { source: 'q5', target: 'rw20', label: 'AAA-AA', value: 20 },
  { source: 'q5', target: 'q6', label: 'A+', value: 30 },
  { source: 'q6', target: 'rw20', label: 'No', value: 10 },
  { source: 'q6', target: 'rw50', label: 'Yes', value: 20 },
  { source: 'q7', target: 'rw150', label: 'No', value: 5 },
  { source: 'q8', target: 'rw75', label: 'Yes', value: 10 },
]

<FlowDiagram
  nodes={baselNodes}
  edges={baselEdges}
  variant="sankey"
  className="h-[500px]"
/>`,
      language: 'tsx',
      preview: (
        <FlowDiagram
          nodes={[
            { id: 'start', label: 'Counterparty', status: 'confirmed', value: 100, metadata: { exposure: '$1M', type: 'Assessment Start' } },
            // CHOSEN PATH - all confirmed
            { id: 'q1', label: 'Central Govt?', status: 'confirmed', metadata: { article: 'CRR Art 114', answer: 'No - Corporate Entity' } },
            { id: 'q4', label: 'Bank/Investment Firm?', status: 'confirmed', metadata: { article: 'CRR Art 120', answer: 'No - Corporate' } },
            { id: 'q7', label: 'Corporate Entity?', status: 'confirmed', metadata: { article: 'CRR Art 122', answer: 'Yes - Corporation' } },
            { id: 'q8', label: 'SME?', status: 'confirmed', metadata: { article: 'CRR Art 501', answer: 'No - Large Corp' } },
            { id: 'rw100', label: '100% RW', value: 100, status: 'complete', metadata: { citation: 'CRR Art 122', exposure: '$1M', result: 'FINAL CLASSIFICATION' } },
            // NOT CHOSEN - all gray (no status)
            { id: 'q2', label: 'OECD Member?', metadata: { article: 'CRR Art 114(2)' } },
            { id: 'q3', label: 'Credit Quality?', metadata: { article: 'CRR Art 114(4)' } },
            { id: 'q5', label: 'Credit Rating?', metadata: { article: 'CRR Art 120(2)' } },
            { id: 'q6', label: 'Maturity > 3mo?', metadata: { article: 'CRR Art 120(3)' } },
            { id: 'rw0', label: '0% RW', value: 0, metadata: { citation: 'CRR Art 114(2)', exposure: '$0' } },
            { id: 'rw20', label: '20% RW', value: 20, metadata: { citation: 'CRR Art 120(2)', exposure: '$200K' } },
            { id: 'rw50', label: '50% RW', value: 50, metadata: { citation: 'CRR Art 120(3)', exposure: '$500K' } },
            { id: 'rw75', label: '75% RW', value: 75, metadata: { citation: 'CRR Art 501', exposure: '$750K' } },
            { id: 'rw150', label: '150% RW', value: 150, metadata: { citation: 'CRR Art 128', exposure: '$1.5M' } },
          ]}
          edges={[
            // CHOSEN PATH - will be blue
            { source: 'start', target: 'q1', value: 100 },
            { source: 'q1', target: 'q4', label: 'No', value: 70 },
            { source: 'q4', target: 'q7', label: 'No', value: 20 },
            { source: 'q7', target: 'q8', label: 'Yes', value: 15 },
            { source: 'q8', target: 'rw100', label: 'No', value: 5 },
            // NOT CHOSEN - will be gray
            { source: 'q1', target: 'q2', label: 'Yes', value: 30 },
            { source: 'q2', target: 'rw0', label: 'Yes', value: 30 },
            { source: 'q2', target: 'q3', label: 'No', value: 0 },
            { source: 'q4', target: 'q5', label: 'Yes', value: 50 },
            { source: 'q5', target: 'rw20', label: 'AAA-AA', value: 20 },
            { source: 'q5', target: 'q6', label: 'A+', value: 30 },
            { source: 'q6', target: 'rw20', label: 'No', value: 10 },
            { source: 'q6', target: 'rw50', label: 'Yes', value: 20 },
            { source: 'q7', target: 'rw150', label: 'No', value: 5 },
            { source: 'q8', target: 'rw75', label: 'Yes', value: 10 },
          ]}
          variant="sankey"
          className="h-[500px]"
        />
      )
    }
  ],
  dependencies: ['d3-sankey', 'd3-shape'],
  tags: ['flow', 'diagram', 'graph', 'visualization', 'utxo', 'blockchain', 'decision-tree', 'audit', 'time-travel', 'sankey']
};
