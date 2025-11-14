/**
 * Workflow Session Storage
 *
 * Persists verification and classification results across pages
 * Allows seamless flow: Verify → Classify → Anchor
 */

import type { VerificationResult, VerificationResultUI } from '@/types/vlei';
import type { ClassificationResult } from '@/types/decision-tree';

const STORAGE_KEYS = {
  VERIFICATION: 'leicca_verification_result',
  VERIFICATION_UI: 'leicca_verification_result_ui', // NEW: Stores UI format with KEL state
  CLASSIFICATION: 'leicca_classification_result',
  CREDENTIAL_FILE: 'leicca_credential_file',
  EVIDENCE_FILES: 'leicca_evidence_files',
  SCREENSHOT: 'leicca_screenshot',
} as const;

export interface StoredCredentialFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  // Store as base64 for session storage
  dataUrl: string;
}

export interface StoredEvidenceFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl: string;
}

/**
 * Store verification result in session storage
 * Accepts VerificationResultUI and converts to VerificationResult format
 */
export function storeVerificationResult(result: VerificationResultUI): void {
  if (typeof window === 'undefined') return;

  // Convert UI format to VerificationResult format for blockchain anchoring
  const verificationResult: VerificationResult = {
    verified: result.verified,
    credential: result.credential ? {
      v: 'ACDC10JSON000197_',
      d: result.credential.said,
      i: 'EL_GLEIF_QVI',
      ri: 'GLEIF_QVI_ROOT',
      s: result.credential.said,
      a: {
        d: 'EL_GLEIF_Data',
        i: 'EL_GLEIF_QVI',
        dt: result.credential.issuedDate,
        LEI: result.credential.lei
      },
      r: {
        d: 'EL_GLEIF_Rules',
        usageDisclaimer: { l: 'Usage terms apply' },
        issuanceDisclaimer: { l: 'Issuance terms apply' }
      },
      e: {
        d: 'EL_GLEIF_Endorsements',
        qvi: {
          n: 'GLEIF_QVI_Node',
          s: 'GLEIF_QVI_Schema'
        }
      }
    } : null,
    jurisdiction: result.credential?.jurisdiction || null,
    errors: result.errors,
    timestamp: result.verification?.timestamp || new Date().toISOString(),
    verificationMethod: 'structure-validation',
    mockVerification: !result.verified
  };

  sessionStorage.setItem(STORAGE_KEYS.VERIFICATION, JSON.stringify(verificationResult));

  // ALSO store the UI version with KEL state for temporal proof
  sessionStorage.setItem(STORAGE_KEYS.VERIFICATION_UI, JSON.stringify(result));
}

/**
 * Get verification result from session storage
 */
export function getVerificationResult(): VerificationResult | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEYS.VERIFICATION);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Get verification result UI from session storage (includes KEL state for temporal proof)
 */
export function getVerificationResultUI(): VerificationResultUI | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEYS.VERIFICATION_UI);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Store classification result in session storage
 */
export function storeClassificationResult(result: ClassificationResult): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.CLASSIFICATION, JSON.stringify(result));
}

/**
 * Get classification result from session storage
 */
export function getClassificationResult(): ClassificationResult | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEYS.CLASSIFICATION);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Store credential file in session storage
 */
export async function storeCredentialFile(file: File): Promise<void> {
  if (typeof window === 'undefined') return;

  const dataUrl = await fileToDataUrl(file);
  const stored: StoredCredentialFile = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    dataUrl,
  };

  sessionStorage.setItem(STORAGE_KEYS.CREDENTIAL_FILE, JSON.stringify(stored));
}

/**
 * Get credential file from session storage
 */
export async function getCredentialFile(): Promise<File | null> {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEYS.CREDENTIAL_FILE);
  if (!stored) return null;

  const data: StoredCredentialFile = JSON.parse(stored);
  return await dataUrlToFile(data.dataUrl, data.name, data.type);
}

/**
 * Store evidence files in session storage
 */
export async function storeEvidenceFiles(files: File[]): Promise<void> {
  if (typeof window === 'undefined') return;

  const stored: StoredEvidenceFile[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      dataUrl: await fileToDataUrl(file),
    }))
  );

  sessionStorage.setItem(STORAGE_KEYS.EVIDENCE_FILES, JSON.stringify(stored));
}

/**
 * Get evidence files from session storage
 */
export async function getEvidenceFiles(): Promise<File[]> {
  if (typeof window === 'undefined') return [];
  const stored = sessionStorage.getItem(STORAGE_KEYS.EVIDENCE_FILES);
  if (!stored) return [];

  const data: StoredEvidenceFile[] = JSON.parse(stored);
  return await Promise.all(
    data.map((item) => dataUrlToFile(item.dataUrl, item.name, item.type))
  );
}

/**
 * Clear all workflow data from session storage
 */
export function clearWorkflowData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Check if verification result exists
 */
export function hasVerificationResult(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.VERIFICATION) !== null;
}

/**
 * Check if classification result exists
 */
export function hasClassificationResult(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.CLASSIFICATION) !== null;
}

/**
 * Convert File to data URL
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert data URL back to File
 */
async function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Store screenshot with hash in session storage
 */
export function storeScreenshot(screenshot: {
  filename: string;
  hash: string;
  dataUrl: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEYS.SCREENSHOT, JSON.stringify(screenshot));
  } catch (error) {
    console.error('Failed to store screenshot:', error);
  }
}

/**
 * Get screenshot from session storage
 */
export function getScreenshot(): {
  filename: string;
  hash: string;
  dataUrl: string;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.SCREENSHOT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get screenshot:', error);
    return null;
  }
}
