import type Konva from 'konva';
import { useCallback, useEffect, useState } from 'react';

interface UseCanvasReadyStateProps {
  stage: Konva.Stage | null;
}

export const useCanvasReadyState = ({ stage }: UseCanvasReadyStateProps) => {
  const [isEncounterReady, setIsEncounterReady] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [handlersReady, setHandlersReady] = useState<boolean>(false);

  useEffect(() => {
    if (stage && imagesLoaded && handlersReady && !isEncounterReady) {
      queueMicrotask(() => {
        setIsEncounterReady(true);
      });
    }
  }, [stage, imagesLoaded, handlersReady, isEncounterReady]);

  const handleImagesLoaded = useCallback(() => {
    setImagesLoaded(true);
  }, []);

  const handleHandlersReady = useCallback(() => {
    setHandlersReady(true);
  }, []);

  return {
    isEncounterReady,
    imagesLoaded,
    handlersReady,
    handleImagesLoaded,
    handleHandlersReady,
  };
};
