// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Service)

/**
 * UndoRedoManager Service
 * Implements Command pattern for undo/redo functionality in encounter editor
 * Features:
 * - 100-level history stack (configurable)
 * - Support for all encounter operations (place, move, delete assets)
 * - Memory-efficient command storage
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * ACCEPTANCE_CRITERION: AC-03 - Undo/redo works for all encounter operations (100-level default)
 */

import type { PlacedAsset } from '@/types/domain';

/**
 * Command interface for undo/redo operations
 * All encounter operations must implement this interface
 */
export interface Command {
  /** Command type for debugging and logging */
  type: string;
  /** Execute the command (do the operation) */
  execute(): void;
  /** Undo the command (revert the operation) */
  undo(): void;
  /** Optional: Description for UI display */
  description?: string;
}

/**
 * Place Asset Command
 * Records placing a new asset on the encounter
 */
export class PlaceAssetCommand implements Command {
  type = 'PlaceAsset';
  description: string;

  constructor(
    private asset: PlacedAsset,
    private placedAssets: PlacedAsset[],
    private onUpdate: (assets: PlacedAsset[]) => void,
  ) {
    this.description = `Place ${asset.asset.name}`;
  }

  execute(): void {
    // Add asset to encounter
    this.placedAssets.push(this.asset);
    this.onUpdate([...this.placedAssets]);
  }

  undo(): void {
    // Remove asset from encounter
    const index = this.placedAssets.findIndex((a) => a.id === this.asset.id);
    if (index !== -1) {
      this.placedAssets.splice(index, 1);
      this.onUpdate([...this.placedAssets]);
    }
  }
}

/**
 * Move Asset Command
 * Records moving an asset to a new position
 */
export class MoveAssetCommand implements Command {
  type = 'MoveAsset';
  description: string;

  constructor(
    private assetId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number },
    private placedAssets: PlacedAsset[],
    private onUpdate: (assets: PlacedAsset[]) => void,
  ) {
    const asset = placedAssets.find((a) => a.id === assetId);
    this.description = `Move ${asset?.asset.name || 'asset'}`;
  }

  execute(): void {
    // Move asset to new position
    const asset = this.placedAssets.find((a) => a.id === this.assetId);
    if (asset) {
      asset.position = { ...this.newPosition };
      this.onUpdate([...this.placedAssets]);
    }
  }

  undo(): void {
    // Move asset back to old position
    const asset = this.placedAssets.find((a) => a.id === this.assetId);
    if (asset) {
      asset.position = { ...this.oldPosition };
      this.onUpdate([...this.placedAssets]);
    }
  }
}

/**
 * Delete Asset Command
 * Records deleting an asset from the encounter
 */
export class DeleteAssetCommand implements Command {
  type = 'DeleteAsset';
  description: string;
  private deletedAsset: PlacedAsset | null = null;

  constructor(
    private assetId: string,
    private placedAssets: PlacedAsset[],
    private onUpdate: (assets: PlacedAsset[]) => void,
  ) {
    const asset = placedAssets.find((a) => a.id === assetId);
    this.description = `Delete ${asset?.asset.name || 'asset'}`;
  }

  execute(): void {
    // Remove asset and store for undo
    const index = this.placedAssets.findIndex((a) => a.id === this.assetId);
    if (index !== -1) {
      this.deletedAsset = this.placedAssets[index] ?? null;
      this.placedAssets.splice(index, 1);
      this.onUpdate([...this.placedAssets]);
    }
  }

  undo(): void {
    // Restore deleted asset
    if (this.deletedAsset) {
      this.placedAssets.push(this.deletedAsset);
      this.onUpdate([...this.placedAssets]);
    }
  }
}

/**
 * Batch Command
 * Groups multiple commands into a single undo/redo operation
 */
export class BatchCommand implements Command {
  type = 'Batch';
  description: string;

  constructor(
    private commands: Command[],
    description?: string,
  ) {
    this.description = description || `${commands.length} operations`;
  }

  execute(): void {
    this.commands.forEach((cmd) => cmd.execute());
  }

  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const command = this.commands[i];
      if (command) {
        command.undo();
      }
    }
  }
}

/**
 * UndoRedoManager Configuration
 */
export interface UndoRedoConfig {
  /** Maximum number of commands in history (default: 100) */
  maxHistorySize?: number;
  /** Enable keyboard shortcuts (default: true) */
  enableKeyboardShortcuts?: boolean;
  /** Callback when undo/redo state changes */
  onStateChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
}

/**
 * UndoRedoManager Class
 * Manages command history and undo/redo operations
 */
export class UndoRedoManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistorySize: number;
  private enableKeyboardShortcuts: boolean;
  private onStateChange: ((state: { canUndo: boolean; canRedo: boolean }) => void) | undefined;

  constructor(config: UndoRedoConfig = {}) {
    this.maxHistorySize = config.maxHistorySize ?? 100;
    this.enableKeyboardShortcuts = config.enableKeyboardShortcuts ?? true;
    this.onStateChange = config.onStateChange;

    if (this.enableKeyboardShortcuts) {
      this.setupKeyboardShortcuts();
    }
  }

  /**
   * Execute a command and add to undo stack
   * Clears redo stack on new command
   */
  public execute(command: Command): void {
    command.execute();

    // Add to undo stack
    this.undoStack.push(command);

    // Enforce max history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift(); // Remove oldest command
    }

    // Clear redo stack (new command invalidates redo history)
    this.redoStack = [];

    this.notifyStateChange();
  }

  /**
   * Undo last command
   */
  public undo(): void {
    if (this.undoStack.length === 0) {
      console.warn('Nothing to undo');
      return;
    }

    const command = this.undoStack.pop()!;
    command.undo();

    // Move to redo stack
    this.redoStack.push(command);

    this.notifyStateChange();
  }

  /**
   * Redo last undone command
   */
  public redo(): void {
    if (this.redoStack.length === 0) {
      console.warn('Nothing to redo');
      return;
    }

    const command = this.redoStack.pop()!;
    command.execute();

    // Move back to undo stack
    this.undoStack.push(command);

    this.notifyStateChange();
  }

  /**
   * Check if undo is available
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  public getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  public getRedoCount(): number {
    return this.redoStack.length;
  }

  /**
   * Get last undo command description
   */
  public getUndoDescription(): string | undefined {
    const lastCommand = this.undoStack[this.undoStack.length - 1];
    return lastCommand?.description;
  }

  /**
   * Get last redo command description
   */
  public getRedoDescription(): string | undefined {
    const lastCommand = this.redoStack[this.redoStack.length - 1];
    return lastCommand?.description;
  }

  /**
   * Clear all history
   */
  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyStateChange();
  }

  /**
   * Get current state for debugging
   */
  public getState(): {
    undoStack: string[];
    redoStack: string[];
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      undoStack: this.undoStack.map((cmd) => cmd.description || cmd.type),
      redoStack: this.redoStack.map((cmd) => cmd.description || cmd.type),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  /**
   * Setup keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
   */
  private setupKeyboardShortcuts(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z (Mac) - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }

      // Ctrl+Y or Cmd+Y (Mac) or Ctrl+Shift+Z - Redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Store cleanup function (needs to be called when manager is destroyed)
    (this as any)._keydownHandler = handleKeyDown;
  }

  /**
   * Remove keyboard shortcuts
   * Call this when component unmounts
   */
  public destroy(): void {
    if (this.enableKeyboardShortcuts && (this as any)._keydownHandler) {
      window.removeEventListener('keydown', (this as any)._keydownHandler);
    }
  }

  /**
   * Notify state change callback
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
      });
    }
  }
}

/**
 * Create singleton instance for global encounter editor undo/redo
 * Can be replaced with React Context in future for multi-encounter support
 */
export const undoRedoManager = new UndoRedoManager({
  maxHistorySize: 100,
  enableKeyboardShortcuts: true,
});
