// GENERATED: 2025-10-19 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Test)

/**
 * useAssetDrag Hook Tests
 * Tests asset drag state management
 * TARGET_COVERAGE: 75%+
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Asset, MonsterAsset } from '@/types/domain';
import { AssetKind } from '@/types/domain';
import { useAssetDrag } from './useAssetDrag';

const createMockAsset = (id: string): Asset =>
  ({
    id,
    ownerId: 'owner-123',
    kind: AssetKind.Monster,
    name: `Test Asset ${id}`,
    description: 'Test description',
    isPublished: true,
    isPublic: false,
    tokens: [],
    portrait: undefined,
    size: { width: 1, height: 1, isSquare: true },
    statBlockId: undefined,
    tokenStyle: undefined,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }) as MonsterAsset;

describe('useAssetDrag', () => {
  it('initializes with null draggedAsset', () => {
    const { result } = renderHook(() => useAssetDrag());

    expect(result.current.draggedAsset).toBeNull();
  });

  it('sets draggedAsset when startDrag is called', () => {
    const { result } = renderHook(() => useAssetDrag());
    const mockAsset = createMockAsset('asset-1');

    act(() => {
      result.current.startDrag(mockAsset);
    });

    expect(result.current.draggedAsset).toEqual(mockAsset);
  });

  it('clears draggedAsset when endDrag is called', () => {
    const { result } = renderHook(() => useAssetDrag());
    const mockAsset = createMockAsset('asset-1');

    act(() => {
      result.current.startDrag(mockAsset);
    });

    expect(result.current.draggedAsset).toEqual(mockAsset);

    act(() => {
      result.current.endDrag();
    });

    expect(result.current.draggedAsset).toBeNull();
  });

  it('replaces draggedAsset when startDrag is called multiple times', () => {
    const { result } = renderHook(() => useAssetDrag());
    const asset1 = createMockAsset('asset-1');
    const asset2 = createMockAsset('asset-2');

    act(() => {
      result.current.startDrag(asset1);
    });

    expect(result.current.draggedAsset).toEqual(asset1);

    act(() => {
      result.current.startDrag(asset2);
    });

    expect(result.current.draggedAsset).toEqual(asset2);
  });

  it('maintains stable function references', () => {
    const { result, rerender } = renderHook(() => useAssetDrag());
    const initialStartDrag = result.current.startDrag;
    const initialEndDrag = result.current.endDrag;

    rerender();

    expect(result.current.startDrag).toBe(initialStartDrag);
    expect(result.current.endDrag).toBe(initialEndDrag);
  });

  it('handles endDrag when no asset is being dragged', () => {
    const { result } = renderHook(() => useAssetDrag());

    act(() => {
      result.current.endDrag();
    });

    expect(result.current.draggedAsset).toBeNull();
  });
});
