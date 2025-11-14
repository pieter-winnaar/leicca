import { AuditEvent } from '@/types/audit';
import fs from 'fs/promises';
import path from 'path';

// Global singleton instance shared across all Server Actions
let globalInstance: AuditLogService | null = null;

// Persistent storage path (use DATA_DIR volume mount or fallback to cwd)
const STORAGE_PATH = path.join(process.env.DATA_DIR || process.cwd(), '.audit-events.json');

export class AuditLogService {
  private events: AuditEvent[] = [];
  private loaded = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): AuditLogService {
    if (!globalInstance) {
      globalInstance = new AuditLogService();
    }
    return globalInstance;
  }

  /**
   * Load events from filesystem (lazy loading)
   */
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    try {
      const data = await fs.readFile(STORAGE_PATH, 'utf-8');
      this.events = JSON.parse(data);
      console.log(`[AuditLogService] Loaded ${this.events.length} events from storage`);
    } catch (error) {
      // File doesn't exist or is invalid - start with empty array
      this.events = [];
      console.log('[AuditLogService] Starting with empty event log');
    }

    this.loaded = true;
  }

  /**
   * Save events to filesystem
   */
  private async saveEvents(): Promise<void> {
    try {
      await fs.writeFile(STORAGE_PATH, JSON.stringify(this.events, null, 2), 'utf-8');
      console.log(`[AuditLogService] Saved ${this.events.length} events to storage`);
    } catch (error) {
      console.error('[AuditLogService] Failed to save events:', error);
    }
  }

  async logEvent(event: AuditEvent): Promise<void> {
    await this.ensureLoaded();
    this.events.push(event);
    console.log(`[AuditLogService] Logged event: ${event.type} - ${event.id}`);
    await this.saveEvents();
  }

  async getEvents(): Promise<AuditEvent[]> {
    await this.ensureLoaded();
    return [...this.events].reverse();
  }

  async getEventById(id: string): Promise<AuditEvent | null> {
    await this.ensureLoaded();
    return this.events.find(e => e.id === id) || null;
  }
}
