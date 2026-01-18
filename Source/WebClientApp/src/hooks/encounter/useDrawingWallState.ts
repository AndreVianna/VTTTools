import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { useState, useRef, useCallback } from 'react';
import type { Pole } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';

export interface DrawingWallState {
    drawingWallIndex: number | null;
    drawingWallDefaultHeight: number;
    drawingWallSegmentType: SegmentType;
    drawingWallIsOpaque: boolean;
    drawingWallState: SegmentState;
    previewWallPoles: Pole[] | null;
}

export interface UseDrawingWallStateReturn {
    // State values
    drawingWallIndex: number | null;
    drawingWallDefaultHeight: number;
    drawingWallSegmentType: SegmentType;
    drawingWallIsOpaque: boolean;
    drawingWallState: SegmentState;

    // State setters
    setDrawingWallIndex: Dispatch<SetStateAction<number | null>>;
    setDrawingWallDefaultHeight: Dispatch<SetStateAction<number>>;
    setDrawingWallSegmentType: Dispatch<SetStateAction<SegmentType>>;
    setDrawingWallIsOpaque: Dispatch<SetStateAction<boolean>>;
    setDrawingWallState: Dispatch<SetStateAction<SegmentState>>;

    // Preview poles (ref-based for performance)
    previewWallPolesRef: MutableRefObject<Pole[] | null>;
    setPreviewWallPoles: (poles: Pole[] | null) => void;
}

export const useDrawingWallState = (): UseDrawingWallStateReturn => {
    const [drawingWallIndex, setDrawingWallIndex] = useState<number | null>(null);
    const [drawingWallDefaultHeight, setDrawingWallDefaultHeight] = useState<number>(10);
    const [drawingWallSegmentType, setDrawingWallSegmentType] = useState<SegmentType>(SegmentType.Wall);
    const [drawingWallIsOpaque, setDrawingWallIsOpaque] = useState<boolean>(true);
    const [drawingWallState, setDrawingWallState] = useState<SegmentState>(SegmentState.Visible);

    const previewWallPolesRef = useRef<Pole[] | null>(null);
    const [, forcePreviewUpdate] = useState(0);

    const setPreviewWallPoles = useCallback((poles: Pole[] | null) => {
        previewWallPolesRef.current = poles;
        forcePreviewUpdate((c) => c + 1);
    }, []);

    return {
        drawingWallIndex,
        drawingWallDefaultHeight,
        drawingWallSegmentType,
        drawingWallIsOpaque,
        drawingWallState,
        setDrawingWallIndex,
        setDrawingWallDefaultHeight,
        setDrawingWallSegmentType,
        setDrawingWallIsOpaque,
        setDrawingWallState,
        previewWallPolesRef,
        setPreviewWallPoles,
    };
};
