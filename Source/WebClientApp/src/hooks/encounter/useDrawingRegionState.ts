import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import type { Point } from '@/types/domain';

export interface UseDrawingRegionStateReturn {
    // State values
    drawingRegionIndex: number | null;
    editingRegionIndex: number | null;
    isEditingRegionVertices: boolean;
    originalRegionVertices: Point[] | null;
    regionPlacementMode: 'polygon' | 'bucketFill' | null;

    // State setters
    setDrawingRegionIndex: Dispatch<SetStateAction<number | null>>;
    setEditingRegionIndex: Dispatch<SetStateAction<number | null>>;
    setIsEditingRegionVertices: Dispatch<SetStateAction<boolean>>;
    setOriginalRegionVertices: Dispatch<SetStateAction<Point[] | null>>;
    setRegionPlacementMode: Dispatch<SetStateAction<'polygon' | 'bucketFill' | null>>;
}

export const useDrawingRegionState = (): UseDrawingRegionStateReturn => {
    const [drawingRegionIndex, setDrawingRegionIndex] = useState<number | null>(null);
    const [editingRegionIndex, setEditingRegionIndex] = useState<number | null>(null);
    const [isEditingRegionVertices, setIsEditingRegionVertices] = useState(false);
    const [originalRegionVertices, setOriginalRegionVertices] = useState<Point[] | null>(null);
    const [regionPlacementMode, setRegionPlacementMode] = useState<'polygon' | 'bucketFill' | null>(null);

    return {
        drawingRegionIndex,
        editingRegionIndex,
        isEditingRegionVertices,
        originalRegionVertices,
        regionPlacementMode,
        setDrawingRegionIndex,
        setEditingRegionIndex,
        setIsEditingRegionVertices,
        setOriginalRegionVertices,
        setRegionPlacementMode,
    };
};
