import { describe, it, expect, beforeEach } from 'vitest';
import { BlockchainAnchoringService } from '../blockchain-anchoring';
import type { VerificationResult } from '@/types/vlei';
import type { ClassificationResult } from '@/types/decision-tree';
import type { EvidenceFile } from '@/types/blockchain';

describe('BlockchainAnchoringService', () => {
  let service: BlockchainAnchoringService;

  beforeEach(() => {
    service = new BlockchainAnchoringService();
  });

  describe('createAuditCapsule', () => {
    it('should create valid audit capsule with verification and classification', () => {
      const verification: VerificationResult = {
        verified: true,
        credential: {
          v: 'ACDC10JSON00011c_',
          d: 'EKT8EjvXxEqCOQpwQrWVAKQQVxQNqJ8rIqOOHJKlT4kE',
          i: 'did:keri:EpZfFk66jpf3uFv7vklXKhzBjUSqWjDbgnv1tXJTQqOk',
          ri: 'did:keri:ENro7uf0ePmiK3jdTo2YCdXLqW7z7xoP6qhhBou6gBLe',
          s: 'EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao',
          a: {
            d: 'EF8gxjZq3gY0SXl1WyV5aD3T6K1V8PxQ3Ln5gO2fqN9Q',
            i: 'did:keri:EpZfFk66jpf3uFv7vklXKhzBjUSqWjDbgnv1tXJTQqOk',
            dt: '2021-06-27T21:26:21.233257+00:00',
            LEI: '254900OPPU84GM83MG36'
          },
          e: {
            d: 'EKY4eGOD7Ln1bC0EZqGTKpGXn0xnE7eRs8j6L8CQaP3Y',
            qvi: {
              n: 'EGU3o6k2Y5tCmkgf0UYW7F3RhVMoJ9E1cX2K8DqZ5L9Q',
              s: 'ELLw8P9T0X3V5bF7nC4K9J2OqR0gY8M1cU6Z3Q5vD7S'
            }
          },
          r: {
            d: 'EL3q4nC7F5R8gT9oX2vY6bM1pU0aZ8W3j5K7D9E4N2S',
            usageDisclaimer: { l: 'Usage Disclaimer text' },
            issuanceDisclaimer: { l: 'Issuance Disclaimer text' }
          }
        },
        jurisdiction: 'KY',
        errors: [],
        timestamp: '2025-11-06T00:00:00.000Z',
        verificationMethod: 'python-verifier',
        mockVerification: false
      };

      const classification: ClassificationResult = {
        panel: 'KY_Insurance Company',
        classification: 'Insurance Company',
        category: 'Financial Institution',
        description: 'Entity is classified as an insurance company',
        success: true,
        decisionPath: [
          { nodeId: 'KY_INS_ALL_1', nodeText: 'Is it regulated?', answer: 'yes' },
          { nodeId: 'KY_INS_ALL_2', nodeText: 'Has license?', answer: 'yes' },
          { nodeId: 'KY_INS_ALL_3', nodeText: 'In good standing?', answer: 'yes' }
        ]
      };

      const evidence: EvidenceFile[] = [
        {
          filename: 'credential.json',
          size: 1024,
          mimetype: 'application/json',
          hash: 'a'.repeat(64),
          uploadedAt: '2025-11-06T00:00:00.000Z'
        }
      ];

      const recordId = 'test-record-123';
      const capsule = service.createAuditCapsule(verification, classification, evidence, recordId);

      expect(capsule.version).toBe('1.0.0');
      expect(capsule.verification).toBe(verification);
      expect(capsule.classification).toBe(classification);
      expect(capsule.evidence).toHaveLength(1);
      expect(capsule.evidence[0].filename).toBe('credential.json');
      expect(capsule.metadata.project).toBe('leicca-vlei-classifier');
      expect(capsule.metadata.basket).toBe('leicca-vlei-audit');
      expect(capsule.metadata.recordId).toBe(recordId);
      expect(capsule.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should create audit capsule with null verification', () => {
      const classification: ClassificationResult = {
        panel: 'KY_Insurance Company',
        classification: 'Insurance Company',
        category: 'Financial Institution',
        description: 'Entity is classified as an insurance company',
        success: true,
        decisionPath: [
          { nodeId: 'KY_INS_ALL_1', nodeText: 'Is it regulated?', answer: 'yes' }
        ]
      };

      const capsule = service.createAuditCapsule(null, classification, [], 'test-record-456');

      expect(capsule.verification).toBeNull();
      expect(capsule.classification).toBe(classification);
      expect(capsule.evidence).toHaveLength(0);
    });

    it('should create audit capsule with null classification', () => {
      const verification: VerificationResult = {
        verified: true,
        credential: null,
        jurisdiction: 'KY',
        errors: [],
        timestamp: '2025-11-06T00:00:00.000Z',
        verificationMethod: 'python-verifier',
        mockVerification: false
      };

      const capsule = service.createAuditCapsule(verification, null, [], 'test-record-789');

      expect(capsule.verification).toBe(verification);
      expect(capsule.classification).toBeNull();
      expect(capsule.evidence).toHaveLength(0);
    });

    it('should create audit capsule with multiple evidence files', () => {
      const evidence: EvidenceFile[] = [
        {
          filename: 'credential.json',
          size: 1024,
          mimetype: 'application/json',
          hash: 'a'.repeat(64),
          uploadedAt: '2025-11-06T00:00:00.000Z'
        },
        {
          filename: 'supporting-doc.pdf',
          size: 2048,
          mimetype: 'application/pdf',
          hash: 'b'.repeat(64),
          uploadedAt: '2025-11-06T00:01:00.000Z'
        }
      ];

      const capsule = service.createAuditCapsule(null, null, evidence, 'test-record-multi');

      expect(capsule.evidence).toHaveLength(2);
      expect(capsule.evidence[0].filename).toBe('credential.json');
      expect(capsule.evidence[1].filename).toBe('supporting-doc.pdf');
    });
  });

  describe('extractPublicTags', () => {
    it('should extract public tags with LEI and jurisdiction', () => {
      const capsule = service.createAuditCapsule(
        {
          verified: true,
          credential: {
            v: 'ACDC10JSON00011c_',
            d: 'EKT8EjvXxEqCOQpwQrWVAKQQVxQNqJ8rIqOOHJKlT4kE',
            i: 'did:keri:test',
            ri: 'did:keri:registry',
            s: 'schema-id',
            a: {
              d: 'attr-id',
              i: 'subject-id',
              dt: '2021-06-27T21:26:21.233257+00:00',
              LEI: '254900OPPU84GM83MG36'
            },
            e: {
              d: 'endorse-id',
              qvi: { n: 'qvi-node', s: 'qvi-schema' }
            },
            r: {
              d: 'rules-id',
              usageDisclaimer: { l: 'usage' },
              issuanceDisclaimer: { l: 'issuance' }
            }
          },
          jurisdiction: 'KY',
          errors: [],
          timestamp: '2025-11-06T00:00:00.000Z',
          verificationMethod: 'python-verifier',
          mockVerification: false
        },
        null,
        [],
        'test-record-tags'
      );

      const tags = service.extractPublicTags(capsule);

      expect(tags.type).toBe('LEICCA-Classification');
      expect(tags.lei).toBe('254900OPPU84GM83MG36');
      expect(tags.jurisdiction).toBe('KY');
      expect(tags.timestamp).toBe(capsule.metadata.timestamp);
      expect(tags.recordId).toBe('test-record-tags');
    });

    it('should extract public tags without LEI when credential is null', () => {
      const capsule = service.createAuditCapsule(
        {
          verified: false,
          credential: null,
          jurisdiction: 'AD',
          errors: ['Invalid credential'],
          timestamp: '2025-11-06T00:00:00.000Z',
          verificationMethod: 'python-verifier',
          mockVerification: false
        },
        null,
        [],
        'test-record-no-lei'
      );

      const tags = service.extractPublicTags(capsule);

      expect(tags.type).toBe('LEICCA-Classification');
      expect(tags.lei).toBeUndefined();
      expect(tags.jurisdiction).toBe('AD');
      expect(tags.timestamp).toBe(capsule.metadata.timestamp);
      expect(tags.recordId).toBe('test-record-no-lei');
    });

    it('should extract public tags without jurisdiction when verification is null', () => {
      const capsule = service.createAuditCapsule(null, null, [], 'test-record-no-jurisdiction');

      const tags = service.extractPublicTags(capsule);

      expect(tags.type).toBe('LEICCA-Classification');
      expect(tags.lei).toBeUndefined();
      expect(tags.jurisdiction).toBeUndefined();
      expect(tags.timestamp).toBe(capsule.metadata.timestamp);
      expect(tags.recordId).toBe('test-record-no-jurisdiction');
    });
  });

  describe('serializeCapsule', () => {
    it('should serialize capsule to compact JSON', () => {
      const capsule = service.createAuditCapsule(null, null, [], 'test-serialize');
      const serialized = service.serializeCapsule(capsule);

      expect(serialized).toBeTypeOf('string');
      expect(() => JSON.parse(serialized)).not.toThrow();

      const parsed = JSON.parse(serialized);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.metadata.recordId).toBe('test-serialize');

      // Verify compact format (no indentation)
      expect(serialized).not.toContain('\n  ');
    });

    it('should serialize capsule with all fields', () => {
      const verification: VerificationResult = {
        verified: true,
        credential: null,
        jurisdiction: 'KY',
        errors: [],
        timestamp: '2025-11-06T00:00:00.000Z',
        verificationMethod: 'python-verifier',
        mockVerification: false
      };

      const classification: ClassificationResult = {
        panel: 'KY_Insurance Company',
        classification: 'Insurance Company',
        category: 'Financial Institution',
        description: 'Entity is classified as an insurance company',
        success: true,
        decisionPath: [
          { nodeId: 'KY_INS_ALL_1', nodeText: 'Is it regulated?', answer: 'yes' }
        ]
      };

      const evidence: EvidenceFile[] = [
        {
          filename: 'test.pdf',
          size: 1024,
          mimetype: 'application/pdf',
          hash: 'c'.repeat(64),
          uploadedAt: '2025-11-06T00:00:00.000Z'
        }
      ];

      const capsule = service.createAuditCapsule(verification, classification, evidence, 'test-full');
      const serialized = service.serializeCapsule(capsule);
      const parsed = JSON.parse(serialized);

      expect(parsed.verification.jurisdiction).toBe('KY');
      expect(parsed.classification.panel).toBe('KY_Insurance Company');
      expect(parsed.evidence).toHaveLength(1);
      expect(parsed.evidence[0].filename).toBe('test.pdf');
    });
  });

  describe('hashEvidence', () => {
    it('should hash evidence file correctly', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const hash = await service.hashEvidence(file);

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
      expect(hash.length).toBe(64);
    });

    it('should return consistent hash for same file', async () => {
      const file1 = new File(['same content'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['same content'], 'test2.txt', { type: 'text/plain' });

      const hash1 = await service.hashEvidence(file1);
      const hash2 = await service.hashEvidence(file2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('anchorAuditCapsule', () => {
    it('should throw error when not initialized', async () => {
      const capsule = service.createAuditCapsule(null, null, [], 'test-anchor');
      const publicTags = service.extractPublicTags(capsule);

      await expect(service.anchorAuditCapsule(capsule, publicTags)).rejects.toThrow(
        'BlockchainAnchoringService not initialized'
      );
    });
  });
});
