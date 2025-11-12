import type Konva from 'konva';
import { type RefObject, useCallback, useEffect, useState } from 'react';

interface UseCanvasReadyStateProps {
  stageRef: RefObject<Konva.Stage | null>;
}

export const useCanvasReadyState = ({ stageRef }: UseCanvasReadyStateProps) => {
  const [isEncounterReady, setIsEncounterReady] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [handlersReady, setHandlersReady] = useState<boolean>(false);

  useEffect(() => {
    if (stageRef.current && imagesLoaded && handlersReady && !isEncounterReady) {
      queueMicrotask(() => {
        setIsEncounterReady(true);
      });
    }
  }, [stageRef, imagesLoaded, handlersReady, isEncounterReady]);

  const handleImagesLoaded = useCallback(() => {
    setImagesLoaded(true);
  }, []);

  const handleHandlersReady = useCallback(() => {
    setHandlersReady(true);
  }, []);

  return {
    isEncounterReady,
    handleImagesLoaded,
    handleHandlersReady,
  };
};
