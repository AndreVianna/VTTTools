// GENERATED: 2025-10-19 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Hook)

/**
 * useKonvaRefs Hook
 * Manages references to Konva Image nodes and Transformer for token interaction
 * Provides clean API for managing multiple token refs in encounter editor
 */

import { useRef, useCallback } from 'react';
import Konva from 'konva';

/**
 * Hook for managing Konva node references
 * Handles image refs and transformer ref for token manipulation
 */
export const useKonvaRefs = () => {
    const imageRefs = useRef<Map<string, Konva.Image>>(new Map());
    const transformerRef = useRef<Konva.Transformer | null>(null);

    const setImageRef = useCallback((id: string, node: Konva.Image | null) => {
        if (node) {
            imageRefs.current.set(id, node);
        } else {
            imageRefs.current.delete(id);
        }
    }, []);

    const getImageRef = useCallback((id: string): Konva.Image | null => {
        return imageRefs.current.get(id) || null;
    }, []);

    const clearImageRefs = useCallback(() => {
        imageRefs.current.clear();
    }, []);

    const getAllImageRefs = useCallback((): Konva.Image[] => {
        return Array.from(imageRefs.current.values());
    }, []);

    return {
        setImageRef,
        getImageRef,
        clearImageRefs,
        getAllImageRefs,
        transformerRef,
    };
};
