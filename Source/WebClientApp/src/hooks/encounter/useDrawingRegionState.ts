import type React from 'react';
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
    setDrawingRegionIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setEditingRegionIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setIsEditingRegionVertices: React.Dispatch<React.SetStateAction<boolean>>;
    setOriginalRegionVertices: React.Dispatch<React.SetStateAction<Point[] | null>>;
    setRegionPlacementMode: React.Dispatch<React.SetStateAction<'polygon' | 'bucketFill' | null>>;
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
