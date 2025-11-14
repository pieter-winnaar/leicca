/**
 * ACDCParser Tests
 *
 * Tests ACDC credential parsing and validation
 * Uses mock credentials from test-credentials/ directory
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ACDCParser } from '../ACDCParser';
import type { VLEICredential } from '@/types/vlei';

// Mock credential based on test-credentials/legal-entity/cayman-bank.json
const mockCaymanBankCredential: VLEICredential = {
  v: "ACDC10JSON00011c_",
  d: "EKY1Bank2024CaymanIslandsLEI9999XYZ001",
  i: "did:keri:EmkPreYpZfFk66jpf3uFv7vklXKhzBrAqjsKAn2EDIPM",
  ri: "did:keri:EymRy7xMwsxUelUauaXtMxTfPAMPAI6FkekwlOjkggt",
  s: "EDg-Ji3kmi_G97Jctxeajpmp1-A8gSpeyElm-XCzTxiE",
  a: {
    d: "ECaymanBankExample001LEI254900CAYMAN001",
    i: "did:keri:EQzFVaMasUf4cZZBKA0pUbRc9T8yUXRFLyM1JDASYqAA",
    dt: "2024-11-01T10:00:00.000000+00:00",
    LEI: "254900CAYMAN001KY01",
  },
  e: {
    d: "EBDmgKOAEwnMGsofWg2m0l63J1awfJafqJyCzTnVkdSw",
    qvi: {
      n: "Et2DOOu4ivLsjpv89vgv6auPntSLx4CvOhGUxMhxPS24",
      s: "EKA57bKBKxr_kN7iN5i7lMUxpMG-s19dRcmov1iDxz-E",
    },
  },
  r: {
    d: "EDIai3Wkd-Z_4cezz9nYEcCK3KNH5saLvZoS_84JL6NU",
    usageDisclaimer: {
      l: "Usage disclaimer text",
    },
    issuanceDisclaimer: {
      l: "Issuance disclaimer text",
    },
  },
};

describe('ACDCParser', () => {
  let parser: ACDCParser;

  beforeEach(() => {
    parser = new ACDCParser();
  });

  describe('parse', () => {
    it('should parse valid credential object', () => {
      const result = parser.parse(mockCaymanBankCredential);

      expect(result.credential).toEqual(mockCaymanBankCredential);
      expect(result.lei).toBe('254900CAYMAN001KY01');
      expect(result.subjectAid).toBe('did:keri:EQzFVaMasUf4cZZBKA0pUbRc9T8yUXRFLyM1JDASYqAA');
      expect(result.issuerAid).toBe('did:keri:EmkPreYpZfFk66jpf3uFv7vklXKhzBrAqjsKAn2EDIPM');
      expect(result.issuanceDate).toBe('2024-11-01T10:00:00.000000+00:00');
      expect(result.credentialSaid).toBe('EKY1Bank2024CaymanIslandsLEI9999XYZ001');
    });

    it('should parse valid credential JSON string', () => {
      const jsonString = JSON.stringify(mockCaymanBankCredential);

      const result = parser.parse(jsonString);

      expect(result.credential).toEqual(mockCaymanBankCredential);
      expect(result.lei).toBe('254900CAYMAN001KY01');
    });

    it('should throw error for invalid JSON string', () => {
      const invalidJson = 'invalid-json-string';

      expect(() => parser.parse(invalidJson)).toThrow();
    });

    it('should throw error for credential missing required fields', () => {
      const invalidCredential = {
        v: "ACDC10JSON00011c_",
        // Missing required fields
      } as any;

      expect(() => parser.parse(invalidCredential)).toThrow('Invalid ACDC credential');
    });
  });

  describe('validateStructure', () => {
    it('should validate valid credential structure', () => {
      const errors = parser.validateStructure(mockCaymanBankCredential);

      expect(errors).toHaveLength(0);
    });

    it('should detect missing version field', () => {
      const invalidCred = { ...mockCaymanBankCredential, v: undefined };

      const errors = parser.validateStructure(invalidCred);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'v')).toBe(true);
    });

    it('should detect missing credential SAID', () => {
      const invalidCred = { ...mockCaymanBankCredential, d: undefined };

      const errors = parser.validateStructure(invalidCred);

      expect(errors.some(e => e.field === 'd')).toBe(true);
    });

    it('should detect missing attributes section', () => {
      const invalidCred = { ...mockCaymanBankCredential, a: undefined };

      const errors = parser.validateStructure(invalidCred);

      expect(errors.some(e => e.field === 'a')).toBe(true);
    });

    it('should detect missing endorsements section', () => {
      const invalidCred = { ...mockCaymanBankCredential, e: undefined };

      const errors = parser.validateStructure(invalidCred);

      expect(errors.some(e => e.field === 'e')).toBe(true);
    });

    it('should detect missing rules section', () => {
      const invalidCred = { ...mockCaymanBankCredential, r: undefined };

      const errors = parser.validateStructure(invalidCred);

      expect(errors.some(e => e.field === 'r')).toBe(true);
    });
  });

  describe('validateSAIDFormat', () => {
    it('should validate correct SAID format', () => {
      const validSaid = 'EKY1Bank2024CaymanIslandsLEI9999XYZ001';

      const result = parser.validateSAIDFormat(validSaid);

      expect(result).toBe(true);
    });

    it('should reject SAID without E prefix', () => {
      const invalidSaid = 'XKY1Bank2024CaymanIslandsLEI9999XYZ001';

      const result = parser.validateSAIDFormat(invalidSaid);

      expect(result).toBe(false);
    });

    it('should reject SAID with incorrect length', () => {
      const invalidSaid = 'EShortSaid';

      const result = parser.validateSAIDFormat(invalidSaid);

      expect(result).toBe(false);
    });

    it('should reject SAID with invalid characters', () => {
      const invalidSaid = 'E@#$%^&*()_+1234567890123456789012345678';

      const result = parser.validateSAIDFormat(invalidSaid);

      expect(result).toBe(false);
    });
  });

  describe('validateAllSAIDs', () => {
    it('should validate all SAIDs in credential', () => {
      const result = parser.validateAllSAIDs(mockCaymanBankCredential);

      expect(result).toBe(true);
    });

    it('should detect invalid credential SAID', () => {
      const invalidCred = {
        ...mockCaymanBankCredential,
        d: 'InvalidSaid',
      };

      const result = parser.validateAllSAIDs(invalidCred);

      expect(result).toBe(false);
    });
  });

  describe('extractJurisdiction', () => {
    it('should extract jurisdiction from legalJurisdiction field', () => {
      const credWithJurisdiction = {
        ...mockCaymanBankCredential,
        a: {
          ...mockCaymanBankCredential.a,
          legalJurisdiction: 'KY',
        } as any,
      };

      const result = parser.extractJurisdiction(credWithJurisdiction);

      expect(result).toBe('KY');
    });

    it('should extract jurisdiction from registeredAddress.country', () => {
      const credWithAddress = {
        ...mockCaymanBankCredential,
        a: {
          ...mockCaymanBankCredential.a,
          registeredAddress: {
            country: 'KY',
          },
        } as any,
      };

      const result = parser.extractJurisdiction(credWithAddress);

      expect(result).toBe('KY');
    });

    it('should return null when no jurisdiction present', () => {
      const result = parser.extractJurisdiction(mockCaymanBankCredential);

      expect(result).toBeNull();
    });
  });
});
