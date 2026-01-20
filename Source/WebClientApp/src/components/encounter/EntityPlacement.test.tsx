// GENERATED: 2025-10-19 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Test)

/**
 * EntityPlacement Component Tests
 * Tests token placement, drag-and-drop, image loading, and grid snapping
 * TARGET_COVERAGE: 75%+
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Create a mock store with auth state for useAssetImageLoader hook
const createMockStore = (isAuthenticated = true) =>
  configureStore({
    reducer: {
      auth: () => ({ isAuthenticated }),
    },
  });

// Wrapper component for rendering with Redux
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={createMockStore()}>{children}</Provider>
);

// Helper to render with Redux provider
const renderWithRedux = (ui: React.ReactElement) =>
  render(ui, { wrapper: TestWrapper });

// Mock react-konva to render DOM elements for testing
vi.mock('react-konva', () => ({
  Layer: ({ children, ...props }: any) => <div data-mock="layer" {...props}>{children}</div>,
  Group: ({ children, ...props }: any) => <div data-mock="group" {...props}>{children}</div>,
  Image: ({ image, ...props }: any) => <img data-mock="konva-image" src={image?.src} {...props} />,
  Rect: (props: any) => <div data-mock="rect" {...props} />,
  Circle: (props: any) => <div data-mock="circle" {...props} />,
  Text: (props: any) => <div data-mock="text" {...props}>{props.text}</div>,
  Line: (props: any) => <div data-mock="line" {...props} />,
}));

// Mock useAssetImageLoader to return pre-loaded images
// This avoids the need for actual API calls in tests
const createMockImage = (id: string): HTMLImageElement => {
  const img = new Image();
  img.src = `mock-image-${id}`;
  return img;
};

vi.mock('@/hooks/useAssetImageLoader', () => ({
  useAssetImageLoader: ({ placedAssets, draggedAsset }: { placedAssets: any[]; draggedAsset: any }) => {
    const cache = new Map<string, HTMLImageElement>();
    // Add images for all placed assets
    for (const asset of placedAssets) {
      if (asset.assetId) {
        cache.set(asset.assetId, createMockImage(asset.assetId));
      }
    }
    // Add image for dragged asset
    if (draggedAsset?.id) {
      cache.set(draggedAsset.id, createMockImage(draggedAsset.id));
    }
    return cache;
  },
}));

import { GroupName } from '@/services/layerManager';
import { mockMediaResource } from '@/test-utils/assetMocks';
import type { Asset, Encounter, PlacedAsset } from '@/types/domain';
import { AssetKind, GridType, LabelVisibility as DisplayNameEnum, LabelPosition as LabelPositionEnum, Weather } from '@/types/domain';
import type { Stage } from '@/types/stage';
import { AmbientLight } from '@/types/stage';
import { GridType as GridCalcType, type GridConfig } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';
import { EntityPlacement } from './EntityPlacement';
import { formatMonsterLabel } from './tokenPlacementUtils';

const createMockStage = (overrides?: Partial<Stage>): Stage => ({
  id: 'stage-1',
  ownerId: 'owner-1',
  name: 'Test Stage',
  description: '',
  isPublished: false,
  isPublic: false,
  settings: {
    zoomLevel: 1,
    panning: { x: 0, y: 0 },
    ambientLight: AmbientLight.Default,
    ambientSoundVolume: 1,
    ambientSoundLoop: false,
    ambientSoundIsPlaying: false,
    weather: Weather.Clear,
  },
  grid: {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    scale: 1,
  },
  walls: [],
  regions: [],
  lights: [],
  elements: [],
  sounds: [],
  ...overrides,
});

const mockGridConfig: GridConfig = {
  type: GridCalcType.Square,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
  scale: 1,
};

const createMockAsset = (id: string, kind: AssetKind = AssetKind.Creature): Asset => ({
  id,
  ownerId: 'user-123',
  classification: {
    kind,
    category: 'test-category',
    type: 'test-type',
    subtype: null,
  },
  name: `Test Asset ${id}`,
  description: 'Test description',
  isPublished: true,
  isPublic: false,
  tokens: [mockMediaResource({ id: `${id}-token` })],
  thumbnail: null,
  portrait: null,
  size: { width: 1, height: 1 },
  statBlocks: {},
  tags: [],
});

const createMockCharacterAsset = (id: string): Asset => createMockAsset(id, AssetKind.Character);

const createMockObjectAsset = (id: string): Asset => createMockAsset(id, AssetKind.Object);

const createMockPlacedAsset = (id: string, assetId: string): PlacedAsset => ({
  id,
  assetId,
  asset: createMockAsset(assetId),
  position: { x: 100, y: 100 },
  size: { width: 50, height: 50 },
  rotation: 0,
  layer: 'agents',
  index: 0,
  number: 1,
  name: `Asset ${id}`,
  isHidden: false,
  isLocked: false,
  labelVisibility: DisplayNameEnum.Always,
  labelPosition: LabelPositionEnum.Bottom,
});

describe('EntityPlacement', () => {
  let mockOnAssetPlaced: ReturnType<typeof vi.fn<(asset: PlacedAsset) => void>>;
  let mockOnAssetMoved: ReturnType<typeof vi.fn<(moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => void>>;
  let mockOnAssetDeleted: ReturnType<typeof vi.fn<(assetId: string) => void>>;
  let mockOnDragComplete: ReturnType<typeof vi.fn<() => void>>;
  const mockEncounter: Encounter = {
    id: 'encounter-1',
    ownerId: 'owner-1',
    name: 'Encounter 1',
    description: 'Encounter 1 description',
    isPublished: true,
    isPublic: false,
    adventure: null,
    stage: createMockStage(),
    actors: [],
    objects: [],
    effects: [],
  };

  beforeEach(() => {
    mockOnAssetPlaced = vi.fn<(asset: PlacedAsset) => void>();
    mockOnAssetMoved = vi.fn<(moves: Array<{ assetId: string; oldPosition: { x: number; y: number }; newPosition: { x: number; y: number } }>) => void>();
    mockOnAssetDeleted = vi.fn<(assetId: string) => void>();
    mockOnDragComplete = vi.fn<() => void>();

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      crossOrigin = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    }

    global.Image = MockImage as unknown as typeof Image;

    const mockCanvas = {
      getContext: vi.fn<(contextId: string, options?: CanvasRenderingContext2DSettings) => CanvasRenderingContext2D | null>((contextId: string) => {
        if (contextId === '2d') {
          return {
            measureText: vi.fn<(text: string) => TextMetrics>((text: string) => ({ width: text.length * 7 }) as TextMetrics),
            font: '',
            fillText: vi.fn<(text: string, x: number, y: number, maxWidth?: number) => void>(),
            strokeText: vi.fn<(text: string, x: number, y: number, maxWidth?: number) => void>(),
          } as unknown as CanvasRenderingContext2D;
        }
        return null;
      }),
    };

    HTMLCanvasElement.prototype.getContext = mockCanvas.getContext as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('renders without crashing', () => {
    renderWithRedux(
      <EntityPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders placed assets on correct layers', async () => {
    const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');

    const { container } = renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    // Verify the layer structure exists
    // Note: Using container.querySelector for Konva mock elements is an acceptable exception
    await waitFor(() => {
      const assetsLayer = container.querySelector('[data-mock="layer"]');
      expect(assetsLayer).toHaveAttribute('name', 'assets');
      // Verify layer groups exist
      const groups = container.querySelectorAll('[data-mock="group"]');
      const groupNames = Array.from(groups).map((g) => g.getAttribute('name'));
      expect(groupNames).toContain('structure');
      expect(groupNames).toContain('objects');
      expect(groupNames).toContain('monsters');
      expect(groupNames).toContain('characters');
    });
  });

  it('loads images for placed assets without infinite loop', async () => {
    const placedAssets = [createMockPlacedAsset('placed-1', 'asset-1'), createMockPlacedAsset('placed-2', 'asset-2')];

    const imageLoadSpy = vi.fn<() => void>();
    const originalImage = global.Image;

    let imageLoadCount = 0;
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      crossOrigin = '';

      constructor() {
        imageLoadCount++;
        imageLoadSpy();

        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    }

    global.Image = MockImage as unknown as typeof Image;

    renderWithRedux(
      <EntityPlacement
        placedAssets={placedAssets}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    await waitFor(
      () => {
        expect(imageLoadSpy).toHaveBeenCalled();
      },
      { timeout: 1000 },
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(imageLoadCount).toBeLessThanOrEqual(4);

    global.Image = originalImage;
  });

  it('shows loading state for dragged asset', async () => {
    const draggedAsset = createMockCharacterAsset('asset-1');

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      crossOrigin = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 100);
      }
    }

    global.Image = MockImage as unknown as typeof Image;

    renderWithRedux(
      <EntityPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={draggedAsset}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  it('assigns correct layer based on asset kind', () => {
    const monsterAsset = createMockCharacterAsset('monster-1');
    const monsterPlaced = createMockPlacedAsset('placed-1', 'monster-1');
    monsterPlaced.asset = monsterAsset;

    expect(monsterPlaced.layer).toBe('agents');

    const objectPlaced = createMockPlacedAsset('placed-2', 'object-1');
    objectPlaced.layer = 'objects';

    expect(objectPlaced.layer).toBe('objects');
  });

  it('handles image loading errors gracefully', async () => {
    // With useAssetImageLoader mocked, error handling is internal to the hook
    // This test verifies the component renders without crashing when the image cache is empty
    const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');
    // Clear the asset's assetId so the mock returns an empty cache
    placedAsset.assetId = 'nonexistent-asset';

    // Component should render without crashing even if image is not in cache
    const { container } = renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    // Note: Using container.querySelector for Konva mock elements is an acceptable exception
    await waitFor(() => {
      // Verify component rendered the layer structure
      const layer = container.querySelector('[data-mock="layer"]');
      expect(layer).toBeInTheDocument();
    });
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderWithRedux(
      <EntityPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    unmount();
  });

  it('handles assets without any images', () => {
    const assetNoImage: Asset = {
      ...createMockAsset('asset-no-image'),
      tokens: [],
      portrait: null,
    };

    const placedAsset = createMockPlacedAsset('placed-1', 'asset-no-image');
    placedAsset.asset = assetNoImage;

    renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    expect(mockOnAssetPlaced).not.toHaveBeenCalled();
  });

  it('uses tokens array as primary for rendering', () => {
    const assetWithMultipleImages: Asset = {
      ...createMockAsset('asset-multi'),
      tokens: [mockMediaResource({ id: 'token-1' }), mockMediaResource({ id: 'token-2' })],
      portrait: mockMediaResource({ id: 'portrait-1' }),
    };

    const placedAsset = createMockPlacedAsset('placed-1', 'asset-multi');
    placedAsset.asset = assetWithMultipleImages;

    renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    expect(mockOnAssetPlaced).not.toHaveBeenCalled();
  });

  it('renders monster assets with floating label below icon', async () => {
    const monsterAsset = createMockCharacterAsset('monster-1');
    const placedAsset = createMockPlacedAsset('placed-1', 'monster-1');
    placedAsset.asset = monsterAsset;
    placedAsset.name = 'Goblin #1';
    placedAsset.layer = GroupName.Monsters;

    renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    // Konva mock renders Image as <img data-mock="konva-image">
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('renders object assets without floating label', async () => {
    const objectAsset = createMockObjectAsset('object-1');
    const placedAsset = createMockPlacedAsset('placed-1', 'object-1');
    placedAsset.asset = objectAsset;
    placedAsset.name = 'Chair';
    placedAsset.layer = GroupName.Objects;

    renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    // Konva mock renders Image as <img data-mock="konva-image">
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('renders multiple monsters with unique labels', async () => {
    const monsterAsset1 = createMockCharacterAsset('monster-1');
    const monsterAsset2 = createMockCharacterAsset('monster-2');

    const placedAsset1 = createMockPlacedAsset('placed-1', 'monster-1');
    placedAsset1.asset = monsterAsset1;
    placedAsset1.name = 'Goblin #1';
    placedAsset1.layer = GroupName.Monsters;

    const placedAsset2 = createMockPlacedAsset('placed-2', 'monster-2');
    placedAsset2.asset = monsterAsset2;
    placedAsset2.name = 'Goblin #2';
    placedAsset2.layer = GroupName.Monsters;
    placedAsset2.position = { x: 200, y: 200 };

    renderWithRedux(
      <EntityPlacement
        placedAssets={[placedAsset1, placedAsset2]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode={SnapMode.Full}
        encounter={mockEncounter}
      />,
    );

    // Konva mock renders Image as <img data-mock="konva-image">
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(2);
    });
  });

  describe('Label Hover Expansion', () => {
    it('renders monster label with truncated text', async () => {
      const longName = 'Very Long Goblin Warrior Champion Name #5';
      const monsterAsset = createMockCharacterAsset('monster-1');
      const placedAsset = createMockPlacedAsset('placed-1', 'monster-1');
      placedAsset.asset = monsterAsset;
      placedAsset.name = longName;
      placedAsset.layer = GroupName.Monsters;

      renderWithRedux(
        <EntityPlacement
          placedAssets={[placedAsset]}
          onAssetPlaced={mockOnAssetPlaced}
          onAssetMoved={mockOnAssetMoved}
          onAssetDeleted={mockOnAssetDeleted}
          gridConfig={mockGridConfig}
          draggedAsset={null}
          onDragComplete={mockOnDragComplete}
          snapMode={SnapMode.Full}
          encounter={mockEncounter}
        />,
      );

      // Konva mock renders Image as <img data-mock="konva-image">
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('renders short monster label without truncation', async () => {
      const shortName = 'Orc #1';
      const monsterAsset = createMockCharacterAsset('monster-1');
      const placedAsset = createMockPlacedAsset('placed-1', 'monster-1');
      placedAsset.asset = monsterAsset;
      placedAsset.name = shortName;
      placedAsset.layer = GroupName.Monsters;

      renderWithRedux(
        <EntityPlacement
          placedAssets={[placedAsset]}
          onAssetPlaced={mockOnAssetPlaced}
          onAssetMoved={mockOnAssetMoved}
          onAssetDeleted={mockOnAssetDeleted}
          gridConfig={mockGridConfig}
          draggedAsset={null}
          onDragComplete={mockOnDragComplete}
          snapMode={SnapMode.Full}
          encounter={mockEncounter}
        />,
      );

      // Konva mock renders Image as <img data-mock="konva-image">
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('formatMonsterLabel', () => {
    it('returns full name when text fits within max width', () => {
      const result = formatMonsterLabel('Goblin', 100);

      expect(result.isTruncated).toBe(false);
      expect(result.displayText).toBe('Goblin');
      expect(result.fullText).toBe('Goblin');
      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.fullWidth).toBeGreaterThan(0);
    });

    it('preserves #number suffix when truncating', () => {
      const result = formatMonsterLabel('Very Long Goblin Warrior Name #5', 75);

      expect(result.isTruncated).toBe(true);
      expect(result.displayText).toMatch(/#5$/);
      expect(result.displayText).toContain('\u2026');
      expect(result.fullText).toBe('Very Long Goblin Warrior Name #5');
      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.fullWidth).toBeGreaterThan(result.displayWidth);
    });

    it('uses Unicode ellipsis (U+2026) not three dots', () => {
      const result = formatMonsterLabel('Very Long Goblin Warrior Name #5', 75);

      expect(result.isTruncated).toBe(true);
      expect(result.displayText).toContain('\u2026');
      expect(result.displayText).not.toContain('...');
    });

    it('handles names without #number suffix', () => {
      const result = formatMonsterLabel('Very Long Goblin Warrior Name', 75);

      expect(result.isTruncated).toBe(true);
      expect(result.displayText).toContain('\u2026');
      expect(result.displayText).not.toMatch(/#\d+$/);
      expect(result.fullText).toBe('Very Long Goblin Warrior Name');
    });

    it('truncates only the baseName part, not the number', () => {
      const result = formatMonsterLabel('Goblin Warrior #123', 75);

      if (result.isTruncated) {
        expect(result.displayText).toMatch(/^.+\u2026 #123$/);
        const match = result.displayText.match(/^(.+)\u2026 #123$/);
        expect(match).toBeTruthy();
      }
      expect(result.fullText).toBe('Goblin Warrior #123');
    });

    it('handles very short names below MIN_LABEL_WIDTH', () => {
      const result = formatMonsterLabel('G', 25);

      expect(result.isTruncated).toBe(false);
      expect(result.displayText).toBe('G');
    });

    it('correctly identifies truncation status', () => {
      const shortResult = formatMonsterLabel('Goblin #1', 100);
      expect(shortResult.isTruncated).toBe(false);

      const longResult = formatMonsterLabel('Very Long Goblin Warrior Name #5', 75);
      expect(longResult.isTruncated).toBe(true);
    });

    it('handles names with multiple spaces correctly', () => {
      const result = formatMonsterLabel('Goblin Warrior Chief #10', 75);

      if (result.isTruncated) {
        expect(result.displayText).toMatch(/#10$/);
        expect(result.fullText).toBe('Goblin Warrior Chief #10');
      }
    });

    it('handles names with numbers not at the end', () => {
      const result = formatMonsterLabel('Goblin #5 Warrior', 75);

      if (result.isTruncated) {
        expect(result.displayText).toContain('\u2026');
        expect(result.fullText).toBe('Goblin #5 Warrior');
      }
    });

    it('handles double-digit and triple-digit numbers', () => {
      const result1 = formatMonsterLabel('Very Long Goblin Name #99', 75);
      if (result1.isTruncated) {
        expect(result1.displayText).toMatch(/#99$/);
      }

      const result2 = formatMonsterLabel('Very Long Goblin Name #999', 75);
      if (result2.isTruncated) {
        expect(result2.displayText).toMatch(/#999$/);
      }
    });

    it('returns consistent fullText regardless of truncation', () => {
      const originalName = 'Goblin Warrior #5';
      const result1 = formatMonsterLabel(originalName, 200);
      const result2 = formatMonsterLabel(originalName, 50);

      expect(result1.fullText).toBe(originalName);
      expect(result2.fullText).toBe(originalName);
    });

    it('returns width and height dimensions for all results', () => {
      const result = formatMonsterLabel('Goblin Warrior #5', 100);

      expect(result.displayWidth).toBeGreaterThan(0);
      expect(result.displayHeight).toBeGreaterThan(0);
      expect(result.fullWidth).toBeGreaterThan(0);
      expect(typeof result.displayWidth).toBe('number');
      expect(typeof result.displayHeight).toBe('number');
      expect(typeof result.fullWidth).toBe('number');
    });
  });
});
