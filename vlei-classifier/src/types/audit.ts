export interface AuditEvent {
  id: string;
  type: 'verification' | 'classification' | 'anchoring';
  timestamp: string;
  data: Record<string, any>;
  txid?: string;
  evidenceHash?: string;
}

export interface AuditCapsule {
  version: '1.0';
  timestamp: string;
  event: AuditEvent;
  evidenceHashes: EvidenceHash[];
  metadata: {
    project: 'leicca-vlei-hackathon';
    basket: 'leicca-vlei-audit';
  };
}

export interface EvidenceHash {
  filename: string;
  hash: string;
  algorithm: 'SHA-256';
}
