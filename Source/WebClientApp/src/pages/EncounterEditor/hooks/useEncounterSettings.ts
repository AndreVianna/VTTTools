import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Encounter } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

interface UseEncounterSettingsProps {
    encounterId: string | undefined;
    encounter: Encounter | null;
    setEncounter: (encounter: Encounter | null | ((prev: Encounter | null) => Encounter | null)) => void;
    saveChanges: (overrides?: Partial<{
        name: string;
        description: string;
        grid: GridConfig;
        isPublished: boolean;
    }>) => Promise<void>;
}

export const useEncounterSettings = ({
    encounterId,
    encounter,
    setEncounter,
    saveChanges
}: UseEncounterSettingsProps) => {
    const navigate = useNavigate();

    const handleEncounterNameChange = useCallback((name: string) => {
        if (!encounterId || !encounter) return;
        setEncounter(prev => prev ? { ...prev, name } : null);
    }, [encounterId, encounter, setEncounter]);

    const handleBackClick = useCallback(() => {
        if (encounter?.adventure?.id) {
            navigate(`/adventures/${encounter.adventure.id}`);
        } else {
            navigate('/content-library');
        }
    }, [encounter, navigate]);

    const handleEncounterDescriptionChange = useCallback((description: string) => {
        if (!encounterId || !encounter) {
            return;
        }
        setEncounter(prev => prev ? { ...prev, description } : null);
        saveChanges({ description });
    }, [encounterId, encounter, setEncounter, saveChanges]);

    const handleEncounterPublishedChange = useCallback((isPublished: boolean) => {
        if (!encounterId || !encounter) return;
        saveChanges({ isPublished });
    }, [encounterId, encounter, saveChanges]);

    const handleEncounterUpdate = useCallback((updates: Partial<Encounter>) => {
        if (!encounterId || !encounter) return;
        setEncounter(prev => prev ? { ...prev, ...updates } : null);
    }, [encounterId, encounter, setEncounter]);

    return {
        handleEncounterNameChange,
        handleBackClick,
        handleEncounterDescriptionChange,
        handleEncounterPublishedChange,
        handleEncounterUpdate
    };
};
