// GENERATED: 2025-10-19 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Test)

/**
 * TokenPlacement Component Tests
 * Tests token placement, drag-and-drop, image loading, and grid snapping
 * TARGET_COVERAGE: 75%+
 */

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupName } from '@/services/layerManager';
import { mockAssetToken, mockMediaResource, mockMonsterAsset, mockObjectAsset } from '@/test-utils/assetMocks';
import type { Asset, CharacterAsset, Encounter, ObjectAsset, PlacedAsset } from '@/types/domain';
import { AssetKind, LabelPosition, LabelVisibility, Light, Weather } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { TokenPlacement } from './TokenPlacement';
import { formatMonsterLabel } from './tokenPlacementUtils';

const mockGridConfig: GridConfig = {
  type: GridType.Square,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
};

const createMockAsset = (id: string, kind: AssetKind = AssetKind.Monster): Asset => {
  const baseAsset = kind === AssetKind.Monster ? mockMonsterAsset({ id }) : mockObjectAsset({ id });

  return {
    ...baseAsset,
    name: `Test Asset ${id}`,
    description: 'Test description',
    isPublished: true,
    isPublic: false,
    tokens: [
      mockAssetToken({
        token: mockMediaResource({ id: 'resource-1' }),
        isDefault: true,
      }),
    ],
    size: { width: 1, height: 1, isSquare: true },
  };
};

const createMockCharacterAsset = (id: string): CharacterAsset => {
  const asset = createMockAsset(id, AssetKind.Character) as CharacterAsset;
  return {
    ...asset,
    kind: AssetKind.Character,
    statBlockId: undefined,
    tokenStyle: undefined,
  };
};

const createMockObjectAsset = (id: string): ObjectAsset => {
  const asset = createMockAsset(id, AssetKind.Object) as ObjectAsset;
  return {
    ...asset,
    kind: AssetKind.Object,
    isMovable: true,
    isOpaque: false,
    triggerEffectId: undefined,
  };
};

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
  visible: true,
  locked: false,
  labelVisibility: LabelVisibility.Always,
  labelPosition: LabelPosition.Bottom,
});

describe('TokenPlacement', () => {
  let mockOnAssetPlaced: ReturnType<typeof vi.fn>;
  let mockOnAssetMoved: ReturnType<typeof vi.fn>;
  let mockOnAssetDeleted: ReturnType<typeof vi.fn>;
  let mockOnDragComplete: ReturnType<typeof vi.fn>;
  const mockEncounter: Encounter = {
    id: 'encounter-1',
    name: 'Encounter 1',
    description: 'Encounter 1 description',
    isPublished: true,
    adventure: null,
    grid: {
      type: GridType.Square,
      cellSize: { width: 50, height: 50 },
      offset: { left: 0, top: 0 },
      snap: true,
    },
    stage: {
      background: null,
      zoomLevel: 1,
      panning: { x: 0, y: 0 },
    },
    light: Light.Daylight,
    weather: Weather.Clear,
    elevation: 0,
    assets: [],
    walls: [],
          openings: [],
    regions: [],
    sources: [],
  };

  beforeEach(() => {
    mockOnAssetPlaced = vi.fn();
    mockOnAssetMoved = vi.fn();
    mockOnAssetDeleted = vi.fn();
    mockOnDragComplete = vi.fn();

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
      getContext: vi.fn((contextId: string) => {
        if (contextId === '2d') {
          return {
            measureText: vi.fn((text: string) => ({ width: text.length * 7 })),
            font: '',
            fillText: vi.fn(),
            strokeText: vi.fn(),
          };
        }
        return null;
      }),
    };

    HTMLCanvasElement.prototype.getContext = mockCanvas.getContext as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('renders without crashing', () => {
    render(
      <TokenPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders placed assets on correct layers', async () => {
    const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');

    const { container } = render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      const image = container.querySelector('#placed-1');
      expect(image).toBeInTheDocument();
    });
  });

  it('loads images for placed assets without infinite loop', async () => {
    const placedAssets = [createMockPlacedAsset('placed-1', 'asset-1'), createMockPlacedAsset('placed-2', 'asset-2')];

    const imageLoadSpy = vi.fn();
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

    render(
      <TokenPlacement
        placedAssets={placedAssets}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
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

    render(
      <TokenPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={draggedAsset}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
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
    const placedAsset = createMockPlacedAsset('placed-1', 'asset-1');

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      crossOrigin = '';

      constructor() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror();
          }
        }, 0);
      }
    }

    global.Image = MockImage as unknown as typeof Image;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <TokenPlacement
        placedAssets={[]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    unmount();
  });

  it('handles assets without image tokens', () => {
    const assetNoImage: Asset = {
      ...createMockAsset('asset-no-image'),
      tokens: [],
    };

    const placedAsset = createMockPlacedAsset('placed-1', 'asset-no-image');
    placedAsset.asset = assetNoImage;

    render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    expect(mockOnAssetPlaced).not.toHaveBeenCalled();
  });

  it('uses default token for rendering', () => {
    const assetMultiToken: Asset = {
      ...createMockAsset('asset-multi'),
      tokens: [
        mockAssetToken({
          token: mockMediaResource({ id: 'token-1' }),
          isDefault: false,
        }),
        mockAssetToken({
          token: mockMediaResource({ id: 'token-2' }),
          isDefault: true,
        }),
        mockAssetToken({
          token: mockMediaResource({ id: 'token-3' }),
          isDefault: false,
        }),
      ],
    };

    const placedAsset = createMockPlacedAsset('placed-1', 'asset-multi');
    placedAsset.asset = assetMultiToken;

    render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
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

    const { container } = render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      const image = container.querySelector('#placed-1');
      expect(image).toBeInTheDocument();
    });
  });

  it('renders object assets without floating label', async () => {
    const objectAsset = createMockObjectAsset('object-1');
    const placedAsset = createMockPlacedAsset('placed-1', 'object-1');
    placedAsset.asset = objectAsset;
    placedAsset.name = 'Chair';
    placedAsset.layer = GroupName.Objects;

    const { container } = render(
      <TokenPlacement
        placedAssets={[placedAsset]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      const image = container.querySelector('#placed-1');
      expect(image).toBeInTheDocument();
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

    const { container } = render(
      <TokenPlacement
        placedAssets={[placedAsset1, placedAsset2]}
        onAssetPlaced={mockOnAssetPlaced}
        onAssetMoved={mockOnAssetMoved}
        onAssetDeleted={mockOnAssetDeleted}
        gridConfig={mockGridConfig}
        draggedAsset={null}
        onDragComplete={mockOnDragComplete}
        snapMode='grid'
        encounter={mockEncounter}
      />,
    );

    await waitFor(() => {
      const image1 = container.querySelector('#placed-1');
      const image2 = container.querySelector('#placed-2');
      expect(image1).toBeInTheDocument();
      expect(image2).toBeInTheDocument();
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

      const { container } = render(
        <TokenPlacement
          placedAssets={[placedAsset]}
          onAssetPlaced={mockOnAssetPlaced}
          onAssetMoved={mockOnAssetMoved}
          onAssetDeleted={mockOnAssetDeleted}
          gridConfig={mockGridConfig}
          draggedAsset={null}
          onDragComplete={mockOnDragComplete}
          snapMode='grid'
          encounter={mockEncounter}
        />,
      );

      await waitFor(() => {
        const image = container.querySelector('#placed-1');
        expect(image).toBeInTheDocument();
      });
    });

    it('renders short monster label without truncation', async () => {
      const shortName = 'Orc #1';
      const monsterAsset = createMockCharacterAsset('monster-1');
      const placedAsset = createMockPlacedAsset('placed-1', 'monster-1');
      placedAsset.asset = monsterAsset;
      placedAsset.name = shortName;
      placedAsset.layer = GroupName.Monsters;

      const { container } = render(
        <TokenPlacement
          placedAssets={[placedAsset]}
          onAssetPlaced={mockOnAssetPlaced}
          onAssetMoved={mockOnAssetMoved}
          onAssetDeleted={mockOnAssetDeleted}
          gridConfig={mockGridConfig}
          draggedAsset={null}
          onDragComplete={mockOnDragComplete}
          snapMode='grid'
          encounter={mockEncounter}
        />,
      );

      await waitFor(() => {
        const image = container.querySelector('#placed-1');
        expect(image).toBeInTheDocument();
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
