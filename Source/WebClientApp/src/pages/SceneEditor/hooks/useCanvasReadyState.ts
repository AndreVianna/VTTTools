import { useState, useEffect, useCallback } from 'react';
import type Konva from 'konva';

interface UseCanvasReadyStateProps {
    stageRef: React.RefObject<Konva.Stage | null>;
}

export const useCanvasReadyState = ({ stageRef }: UseCanvasReadyStateProps) => {
    const [isSceneReady, setIsSceneReady] = useState<boolean>(false);
    const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
    const [handlersReady, setHandlersReady] = useState<boolean>(false);

    useEffect(() => {
        console.log('[DEBUG useCanvasReadyState] Checking ready conditions:');
        console.log('[DEBUG useCanvasReadyState] - stageRef.current:', !!stageRef.current);
        console.log('[DEBUG useCanvasReadyState] - imagesLoaded:', imagesLoaded);
        console.log('[DEBUG useCanvasReadyState] - handlersReady:', handlersReady);
        console.log('[DEBUG useCanvasReadyState] - isSceneReady:', isSceneReady);

        if (stageRef.current && imagesLoaded && handlersReady && !isSceneReady) {
            console.log('[DEBUG useCanvasReadyState] ✓ All conditions met - setting isSceneReady = true');
            setIsSceneReady(true);
        }
    }, [stageRef, imagesLoaded, handlersReady, isSceneReady]);

    const handleImagesLoaded = useCallback(() => {
        console.log('[DEBUG useCanvasReadyState] handleImagesLoaded called');
        setImagesLoaded(true);
    }, []);

    const handleHandlersReady = useCallback(() => {
        console.log('[DEBUG useCanvasReadyState] handleHandlersReady called');
        setHandlersReady(true);
    }, []);

    return {
        isSceneReady,
        handleImagesLoaded,
        handleHandlersReady
    };
};
