// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Service)

/**
 * OfflineSyncManager Service
 * Handles offline mode with localStorage persistence and auto-sync
 * Features:
 * - localStorage save on connection loss
 * - Connection monitoring (online/offline detection)
 * - Auto-submit pending changes on reconnect
 * - Conflict resolution (last-write-wins strategy)
 * - localStorage versioning
 * ACCEPTANCE_CRITERION: AC-04 - Offline mode saves changes to localStorage
 * ACCEPTANCE_CRITERION: AC-05 - Connection lost UI blocks editing
 * ACCEPTANCE_CRITERION: AC-06 - Pending changes auto-submit on reconnect
 */

import type { PlacedAsset } from '@/types/domain';

/**
 * Encounter state for offline persistence
 */
export interface OfflineEncounterState {
    encounterId: string;
    placedAssets: PlacedAsset[];
    lastModified: string; // ISO timestamp
    version: number; // Optimistic concurrency version
}

/**
 * Sync status
 */
export enum SyncStatus {
    Online = 'online',
    Offline = 'offline',
    Syncing = 'syncing',
    Error = 'error',
}

/**
 * OfflineSyncManager Configuration
 */
export interface OfflineSyncConfig {
    /** Encounter ID for persistence */
    encounterId: string;
    /** API endpoint for encounter updates (default: /api/encounters/{encounterId}) */
    apiEndpoint?: string;
    /** Auto-save interval in milliseconds (default: 5000ms) */
    autoSaveInterval?: number;
    /** Enable connection monitoring (default: true) */
    enableConnectionMonitoring?: boolean;
    /** Callback when sync status changes */
    onSyncStatusChange?: (status: SyncStatus) => void;
    /** Callback when connection status changes */
    onConnectionChange?: (online: boolean) => void;
    /** Callback when sync error occurs */
    onSyncError?: (error: Error) => void;
}

/**
 * LocalStorage key prefix
 */
const STORAGE_KEY_PREFIX = 'vtttools_encounter_';

/**
 * OfflineSyncManager Class
 * Manages offline persistence and sync for encounter editor
 */
export class OfflineSyncManager {
    private encounterId: string;
    private apiEndpoint: string;
    private autoSaveInterval: number;
    private enableConnectionMonitoring: boolean;
    private onSyncStatusChange: ((status: SyncStatus) => void) | undefined;
    private onConnectionChange: ((online: boolean) => void) | undefined;
    private onSyncError: ((error: Error) => void) | undefined;

    private currentState: OfflineEncounterState | null = null;
    private syncStatus: SyncStatus = SyncStatus.Online;
    private isOnline: boolean = navigator.onLine;
    private autoSaveTimer: number | null = null;
    private syncInProgress: boolean = false;
    private pendingChanges: boolean = false;

    constructor(config: OfflineSyncConfig) {
        this.encounterId = config.encounterId;
        this.apiEndpoint = config.apiEndpoint || `/api/encounters/${config.encounterId}`;
        this.autoSaveInterval = config.autoSaveInterval ?? 5000;
        this.enableConnectionMonitoring = config.enableConnectionMonitoring ?? true;
        this.onSyncStatusChange = config.onSyncStatusChange;
        this.onConnectionChange = config.onConnectionChange;
        this.onSyncError = config.onSyncError;

        this.initialize();
    }

    /**
     * Initialize manager
     */
    private initialize(): void {
        // Load persisted state from localStorage
        this.loadFromLocalStorage();

        // Setup connection monitoring
        if (this.enableConnectionMonitoring) {
            this.setupConnectionMonitoring();
        }

        // Setup auto-save
        this.startAutoSave();
    }

    /**
     * Setup online/offline event listeners
     */
    private setupConnectionMonitoring(): void {
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        // Initial sync attempt if offline state was persisted
        if (this.isOnline && this.pendingChanges) {
            this.syncToServer();
        }
    }

    /**
     * Handle online event
     */
    private handleOnline = (): void => {
        this.isOnline = true;
        this.onConnectionChange?.(true);

        // Auto-sync pending changes
        if (this.pendingChanges) {
            this.syncToServer();
        } else {
            this.setSyncStatus(SyncStatus.Online);
        }
    };

    /**
     * Handle offline event
     */
    private handleOffline = (): void => {
        console.warn('Connection lost');
        this.isOnline = false;
        this.setSyncStatus(SyncStatus.Offline);
        this.onConnectionChange?.(false);

        // Save immediately to localStorage
        if (this.currentState) {
            this.saveToLocalStorage(this.currentState);
        }
    };

    /**
     * Update encounter state (called by parent component)
     */
    public updateState(placedAssets: PlacedAsset[]): void {
        const newState: OfflineEncounterState = {
            encounterId: this.encounterId,
            placedAssets,
            lastModified: new Date().toISOString(),
            version: (this.currentState?.version || 0) + 1,
        };

        this.currentState = newState;
        this.pendingChanges = true;

        // Save to localStorage if offline
        if (!this.isOnline) {
            this.saveToLocalStorage(newState);
        }
    }

    /**
     * Save state to localStorage
     */
    private saveToLocalStorage(state: OfflineEncounterState): void {
        try {
            const key = `${STORAGE_KEY_PREFIX}${this.encounterId}`;
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Load state from localStorage
     */
    private loadFromLocalStorage(): OfflineEncounterState | null {
        try {
            const key = `${STORAGE_KEY_PREFIX}${this.encounterId}`;
            const data = localStorage.getItem(key);

            if (data) {
                const state = JSON.parse(data) as OfflineEncounterState;
                this.currentState = state;
                this.pendingChanges = true;
                return state;
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }

        return null;
    }

    /**
     * Clear localStorage for this encounter
     */
    private clearLocalStorage(): void {
        try {
            const key = `${STORAGE_KEY_PREFIX}${this.encounterId}`;
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    /**
     * Sync current state to server
     */
    public async syncToServer(): Promise<void> {
        if (!this.currentState || !this.pendingChanges || this.syncInProgress) {
            return;
        }

        if (!this.isOnline) {
            console.warn('Cannot sync: offline');
            return;
        }

        this.syncInProgress = true;
        this.setSyncStatus(SyncStatus.Syncing);

        try {
            // Call API to update encounter
            const response = await fetch(this.apiEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    placedAssets: this.currentState.placedAssets,
                    version: this.currentState.version,
                }),
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
            }

            // Sync successful
            this.pendingChanges = false;
            this.clearLocalStorage();
            this.setSyncStatus(SyncStatus.Online);
        } catch (error) {
            console.error('Sync error:', error);
            this.setSyncStatus(SyncStatus.Error);
            this.onSyncError?.(error as Error);

            // Save to localStorage for retry
            this.saveToLocalStorage(this.currentState);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Start auto-save timer
     */
    private startAutoSave(): void {
        if (this.autoSaveTimer !== null) {
            window.clearInterval(this.autoSaveTimer);
        }

        this.autoSaveTimer = window.setInterval(() => {
            if (this.isOnline && this.pendingChanges && !this.syncInProgress) {
                this.syncToServer();
            } else if (!this.isOnline && this.currentState && this.pendingChanges) {
                // Save to localStorage while offline
                this.saveToLocalStorage(this.currentState);
            }
        }, this.autoSaveInterval);
    }

    /**
     * Stop auto-save timer
     */
    private stopAutoSave(): void {
        if (this.autoSaveTimer !== null) {
            window.clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Set sync status and notify
     */
    private setSyncStatus(status: SyncStatus): void {
        this.syncStatus = status;
        this.onSyncStatusChange?.(status);
    }

    /**
     * Get current sync status
     */
    public getSyncStatus(): SyncStatus {
        return this.syncStatus;
    }

    /**
     * Check if online
     */
    public isConnected(): boolean {
        return this.isOnline;
    }

    /**
     * Check if there are pending changes
     */
    public hasPendingChanges(): boolean {
        return this.pendingChanges;
    }

    /**
     * Get persisted state (for initial load)
     */
    public getPersistedState(): OfflineEncounterState | null {
        return this.currentState;
    }

    /**
     * Force sync now
     */
    public forceSyncNow(): Promise<void> {
        return this.syncToServer();
    }

    /**
     * Destroy manager (cleanup)
     */
    public destroy(): void {
        this.stopAutoSave();

        if (this.enableConnectionMonitoring) {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }

        // Final sync attempt if online
        if (this.isOnline && this.pendingChanges) {
            this.syncToServer();
        }
    }
}
