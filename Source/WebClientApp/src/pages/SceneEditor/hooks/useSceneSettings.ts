import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Scene } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

interface UseSceneSettingsProps {
    sceneId: string | undefined;
    scene: Scene | null;
    setScene: (scene: Scene | null | ((prev: Scene | null) => Scene | null)) => void;
    saveChanges: (overrides?: Partial<{
        name: string;
        description: string;
        grid: GridConfig;
        isPublished: boolean;
    }>) => Promise<void>;
}

export const useSceneSettings = ({
    sceneId,
    scene,
    setScene,
    saveChanges
}: UseSceneSettingsProps) => {
    const navigate = useNavigate();

    const handleSceneNameChange = useCallback((name: string) => {
        if (!sceneId || !scene) return;
        setScene(prev => prev ? { ...prev, name } : null);
    }, [sceneId, scene, setScene]);

    const handleBackClick = useCallback(() => {
        if (scene?.adventure?.id) {
            navigate(`/adventures/${scene.adventure.id}`);
        } else {
            navigate('/content-library');
        }
    }, [scene, navigate]);

    const handleSceneDescriptionChange = useCallback((description: string) => {
        if (!sceneId || !scene) {
            return;
        }
        setScene(prev => prev ? { ...prev, description } : null);
        saveChanges({ description });
    }, [sceneId, scene, setScene, saveChanges]);

    const handleScenePublishedChange = useCallback((isPublished: boolean) => {
        if (!sceneId || !scene) return;
        saveChanges({ isPublished });
    }, [sceneId, scene, saveChanges]);

    const handleSceneUpdate = useCallback((updates: Partial<Scene>) => {
        if (!sceneId || !scene) return;
        setScene(prev => prev ? { ...prev, ...updates } : null);
    }, [sceneId, scene, setScene]);

    return {
        handleSceneNameChange,
        handleBackClick,
        handleSceneDescriptionChange,
        handleScenePublishedChange,
        handleSceneUpdate
    };
};
