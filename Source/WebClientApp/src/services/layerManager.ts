// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/EncounterManagement/UseCases/ConfigureGrid/USE_CASE.md
// USE_CASE: ConfigureGrid (supporting ConfigureStage)
// LAYER: UI (Service)

/**
 * Layer Manager Service
 * Manages Konva layer z-ordering and visibility for encounter editor
 * Ensures proper rendering order: background → grid → tokens → foreground
 * QUALITY_GATE: Layers maintain proper z-order (Phase 4 Gate 4)
 */

import type Konva from 'konva';

/**
 * Layer names for 5-layer architecture
 * Reduced from 6+ layers for performance optimization
 */
export enum LayerName {
  Static = 'static',
  GameWorld = 'game-world',
  Assets = 'assets',
  DrawingTools = 'drawing-tools',
  SelectionHandles = 'selection-handles',
}

/**
 * Group names for organizing content within layers
 * Groups provide logical organization without layer performance cost
 */
export enum GroupName {
  Background = 'background',
  Grid = 'grid',
  Structure = 'structure',
  Objects = 'objects',
  Monsters = 'monsters',
  Characters = 'characters',
  PersistentEffects = 'persistent-effects',
  TemporaryEffects = 'temporary-effects',
  Transformer = 'transformer',
}

/**
 * Layer z-index constants (determines render order)
 * Lower values render first (bottom), higher values render last (top)
 *
 * NOTE: These constants are for LayerManager internal use only.
 * DO NOT use these as zIndex props on React-Konva Layer components.
 * React-Konva expects layers to be ordered by JSX render order, not zIndex props.
 */
export const LayerZIndex = {
  STATIC: 0,
  GAME_WORLD: 1,
  ASSETS: 2,
  DRAWING_TOOLS: 3,
  SELECTION_HANDLES: 4,
} as const;

/**
 * Layer z-index mapping
 * Maps LayerName enum to z-index values
 * 0: Static (background + grid)
 * 1: GameWorld (structures: walls, regions, sources, openings, transformers)
 * 2: Assets (tokens: objects, monsters, characters)
 * 3: DrawingTools (wall/region/source/opening placement tools with preview cursors)
 * 4: SelectionHandles (token selection boxes, rotation handles, marquee)
 */
export const LAYER_Z_INDEX = {
  [LayerName.Static]: LayerZIndex.STATIC,
  [LayerName.GameWorld]: LayerZIndex.GAME_WORLD,
  [LayerName.Assets]: LayerZIndex.ASSETS,
  [LayerName.DrawingTools]: LayerZIndex.DRAWING_TOOLS,
  [LayerName.SelectionHandles]: LayerZIndex.SELECTION_HANDLES,
} as const;

/**
 * Group render order reference (NOT used as zIndex props)
 * React-Konva recommends using JSX render order instead of zIndex for Groups
 * Groups should be rendered in this order:
 * - Structure < Objects < Monsters < Characters for proper z-ordering
 *
 * NOTE: These constants are for reference only. Groups use JSX render order,
 * not zIndex props, to avoid "Node has no parent" warnings.
 */
export const GROUP_Z_INDEX = {
  [GroupName.Background]: 0,
  [GroupName.Grid]: 1,
  [GroupName.Structure]: 100,
  [GroupName.Objects]: 200,
  [GroupName.Monsters]: 300,
  [GroupName.Characters]: 350,
  [GroupName.PersistentEffects]: 100,
  [GroupName.TemporaryEffects]: 200,
  [GroupName.Transformer]: 0,
} as const;

/**
 * Layer visibility state
 */
export interface LayerState {
  name: LayerName;
  visible: boolean;
  zIndex: number;
}

/**
 * LayerManager class
 * Manages layer ordering and visibility for Konva Stage
 */
export class LayerManager {
  private stage: Konva.Stage | null = null;
  private layerStates: Map<LayerName, LayerState> = new Map();

  /**
   * Initialize layer manager with Konva Stage
   * @param stage Konva Stage instance
   */
  public initialize(stage: Konva.Stage): void {
    this.stage = stage;
    this.initializeDefaultLayers();
  }

  /**
   * Initialize default layer states
   */
  private initializeDefaultLayers(): void {
    Object.values(LayerName).forEach((layerName) => {
      this.layerStates.set(layerName, {
        name: layerName,
        visible: true,
        zIndex: LAYER_Z_INDEX[layerName],
      });
    });
  }

  /**
   * Ensure layers are in correct z-order
   * ACCEPTANCE_CRITERION: AC-06 - Layers maintain z-order
   */
  public enforceZOrder(): void {
    if (!this.stage) {
      return;
    }

    // Get all layers
    const layers = this.stage.getLayers();

    // Sort by z-index
    const sortedLayers = layers.sort((a, b) => {
      const nameA = a.name() as LayerName;
      const nameB = b.name() as LayerName;
      const zIndexA = LAYER_Z_INDEX[nameA] ?? 999;
      const zIndexB = LAYER_Z_INDEX[nameB] ?? 999;
      return zIndexA - zIndexB;
    });

    // Reorder layers
    sortedLayers.forEach((layer, index) => {
      layer.moveToTop();
      layer.zIndex(index);
    });

    this.stage.batchDraw();
  }

  /**
   * Get layer by name
   * @param layerName Layer name
   * @returns Layer instance or undefined
   */
  public getLayer(layerName: LayerName): Konva.Layer | undefined {
    if (!this.stage) {
      return undefined;
    }

    return this.stage.findOne(`.${layerName}`) as Konva.Layer | undefined;
  }

  /**
   * Set layer visibility
   * @param layerName Layer to show/hide
   * @param visible Visibility state
   */
  public setLayerVisibility(layerName: LayerName, visible: boolean): void {
    const layer = this.getLayer(layerName);
    if (layer) {
      layer.visible(visible);
      this.stage?.batchDraw();
    }

    // Update state
    const layerState = this.layerStates.get(layerName);
    if (layerState) {
      layerState.visible = visible;
    }
  }

  /**
   * Toggle layer visibility
   * @param layerName Layer to toggle
   * @returns New visibility state
   */
  public toggleLayerVisibility(layerName: LayerName): boolean {
    const layerState = this.layerStates.get(layerName);
    const newVisibility = layerState ? !layerState.visible : true;
    this.setLayerVisibility(layerName, newVisibility);
    return newVisibility;
  }

  /**
   * Get all layer states
   * @returns Array of layer states
   */
  public getLayerStates(): LayerState[] {
    return Array.from(this.layerStates.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  /**
   * Move layer to specified z-index
   * @param layerName Layer to move
   * @param newZIndex New z-index position
   */
  public moveLayer(layerName: LayerName, newZIndex: number): void {
    const layerState = this.layerStates.get(layerName);
    if (layerState) {
      layerState.zIndex = newZIndex;
      this.enforceZOrder();
    }
  }

  /**
   * Reset all layers to default configuration
   */
  public reset(): void {
    this.initializeDefaultLayers();
    this.enforceZOrder();

    // Reset visibility
    Object.values(LayerName).forEach((layerName) => {
      this.setLayerVisibility(layerName, true);
    });
  }
}

// Singleton instance for global layer management
export const layerManager = new LayerManager();
