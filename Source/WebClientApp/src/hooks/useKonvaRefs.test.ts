// GENERATED: 2025-10-19 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Hook Test)

/**
 * useKonvaRefs Hook Tests
 * Tests Konva ref management for tokens
 */

import { act, renderHook } from '@testing-library/react';
import Konva from 'konva';
import { beforeEach, describe, expect, it } from 'vitest';
import { useKonvaRefs } from './useKonvaRefs';

describe('useKonvaRefs', () => {
  let mockImage1: Konva.Image;
  let mockImage2: Konva.Image;

  beforeEach(() => {
    mockImage1 = new Konva.Image({
      id: 'image-1',
      image: new Image(),
    });

    mockImage2 = new Konva.Image({
      id: 'image-2',
      image: new Image(),
    });
  });

  it('should initialize with empty refs', () => {
    const { result } = renderHook(() => useKonvaRefs());

    expect(result.current.getImageRef('image-1')).toBeNull();
    expect(result.current.getAllImageRefs()).toHaveLength(0);
  });

  it('should set and get image ref', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
    });

    expect(result.current.getImageRef('image-1')).toBe(mockImage1);
  });

  it('should handle multiple image refs', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
      result.current.setImageRef('image-2', mockImage2);
    });

    expect(result.current.getImageRef('image-1')).toBe(mockImage1);
    expect(result.current.getImageRef('image-2')).toBe(mockImage2);
    expect(result.current.getAllImageRefs()).toHaveLength(2);
  });

  it('should remove image ref when set to null', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
    });

    expect(result.current.getImageRef('image-1')).toBe(mockImage1);

    act(() => {
      result.current.setImageRef('image-1', null);
    });

    expect(result.current.getImageRef('image-1')).toBeNull();
  });

  it('should update existing ref when set again', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
    });

    expect(result.current.getImageRef('image-1')).toBe(mockImage1);

    act(() => {
      result.current.setImageRef('image-1', mockImage2);
    });

    expect(result.current.getImageRef('image-1')).toBe(mockImage2);
  });

  it('should clear all image refs', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
      result.current.setImageRef('image-2', mockImage2);
    });

    expect(result.current.getAllImageRefs()).toHaveLength(2);

    act(() => {
      result.current.clearImageRefs();
    });

    expect(result.current.getAllImageRefs()).toHaveLength(0);
    expect(result.current.getImageRef('image-1')).toBeNull();
    expect(result.current.getImageRef('image-2')).toBeNull();
  });

  it('should return null for non-existent ref', () => {
    const { result } = renderHook(() => useKonvaRefs());

    expect(result.current.getImageRef('non-existent')).toBeNull();
  });

  it('should maintain transformer ref', () => {
    const { result } = renderHook(() => useKonvaRefs());

    expect(result.current.transformerRef).toBeDefined();
    expect(result.current.transformerRef.current).toBeNull();
  });

  it('should maintain stable references across renders', () => {
    const { result, rerender } = renderHook(() => useKonvaRefs());

    const initialSetImageRef = result.current.setImageRef;
    const initialGetImageRef = result.current.getImageRef;

    rerender();

    expect(result.current.setImageRef).toBe(initialSetImageRef);
    expect(result.current.getImageRef).toBe(initialGetImageRef);
  });

  it('should handle rapid additions and removals', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
      result.current.setImageRef('image-2', mockImage2);
      result.current.setImageRef('image-1', null);
      result.current.setImageRef('image-3', mockImage1);
    });

    expect(result.current.getImageRef('image-1')).toBeNull();
    expect(result.current.getImageRef('image-2')).toBe(mockImage2);
    expect(result.current.getImageRef('image-3')).toBe(mockImage1);
    expect(result.current.getAllImageRefs()).toHaveLength(2);
  });

  it('should return all image refs in correct order', () => {
    const { result } = renderHook(() => useKonvaRefs());

    act(() => {
      result.current.setImageRef('image-1', mockImage1);
      result.current.setImageRef('image-2', mockImage2);
    });

    const allRefs = result.current.getAllImageRefs();
    expect(allRefs).toContain(mockImage1);
    expect(allRefs).toContain(mockImage2);
  });
});
