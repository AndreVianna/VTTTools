export type SceneEntityType = 'assets' | 'walls' | 'regions' | 'sources' | 'effects';

const STORAGE_KEY = 'scene-mappings';

interface EntityTypeMappings {
    assets: Record<string, number>;
    walls: Record<string, number>;
    regions: Record<string, number>;
    sources: Record<string, number>;
    effects: Record<string, number>;
}

interface SceneMappings {
    [sceneId: string]: EntityTypeMappings;
}

function validateId(id: string, fieldName: string): void {
    if (!id || typeof id !== 'string') {
        throw new Error(`Invalid ${fieldName}: must be non-empty string`);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error(`Invalid ${fieldName}: contains illegal characters`);
    }
}

function isSceneMappings(value: unknown): value is SceneMappings {
    if (!value || typeof value !== 'object') return false;

    const obj = value as Record<string, unknown>;
    for (const sceneId in obj) {
        const sceneMappings = obj[sceneId];
        if (!sceneMappings || typeof sceneMappings !== 'object') return false;

        const mappings = sceneMappings as Record<string, unknown>;
        const requiredTypes: SceneEntityType[] = ['assets', 'walls', 'regions', 'sources', 'effects'];
        for (const type of requiredTypes) {
            if (!(type in mappings) || typeof mappings[type] !== 'object') return false;
        }
    }
    return true;
}

function getStoredMappings(): SceneMappings {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return {};
        }
        const parsed = JSON.parse(data);
        if (!isSceneMappings(parsed)) {
            console.error('Corrupted scene mappings data in localStorage');
            return {};
        }
        return parsed;
    } catch (error) {
        console.error('Failed to read scene mappings from localStorage:', error);
        return {};
    }
}

function setStoredMappings(mappings: SceneMappings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
        console.error('Failed to save scene mappings to localStorage:', error);
    }
}

function getSceneMappings(sceneId: string): EntityTypeMappings {
    validateId(sceneId, 'sceneId');
    const allMappings = getStoredMappings();
    return allMappings[sceneId] ?? {
        assets: {},
        walls: {},
        regions: {},
        sources: {},
        effects: {}
    };
}

function setSceneMappings(sceneId: string, mappings: EntityTypeMappings): void {
    validateId(sceneId, 'sceneId');
    const allMappings = getStoredMappings();
    allMappings[sceneId] = mappings;
    setStoredMappings(allMappings);
}

export function setEntityMapping(
    sceneId: string,
    entityType: SceneEntityType,
    domId: string,
    index: number
): void {
    validateId(sceneId, 'sceneId');
    validateId(domId, 'domId');
    const sceneMappings = getSceneMappings(sceneId);
    sceneMappings[entityType][domId] = index;
    setSceneMappings(sceneId, sceneMappings);
}

export function getIndexByDomId(
    sceneId: string,
    entityType: SceneEntityType,
    domId: string
): number | undefined {
    validateId(sceneId, 'sceneId');
    validateId(domId, 'domId');
    const sceneMappings = getSceneMappings(sceneId);
    return sceneMappings[entityType][domId];
}

export function getDomIdByIndex(
    sceneId: string,
    entityType: SceneEntityType,
    index: number
): string | undefined {
    validateId(sceneId, 'sceneId');
    const sceneMappings = getSceneMappings(sceneId);
    const entries = Object.entries(sceneMappings[entityType]);
    const entry = entries.find(([, idx]) => idx === index);
    return entry?.[0];
}

export function removeEntityMapping(
    sceneId: string,
    entityType: SceneEntityType,
    domId: string
): void {
    validateId(sceneId, 'sceneId');
    validateId(domId, 'domId');
    const sceneMappings = getSceneMappings(sceneId);
    delete sceneMappings[entityType][domId];
    setSceneMappings(sceneId, sceneMappings);
}

export function getAllMappings(
    sceneId: string,
    entityType: SceneEntityType
): Record<string, number> {
    validateId(sceneId, 'sceneId');
    const sceneMappings = getSceneMappings(sceneId);
    return { ...sceneMappings[entityType] };
}

export function clearSceneMappings(sceneId: string): void {
    validateId(sceneId, 'sceneId');
    const allMappings = getStoredMappings();
    delete allMappings[sceneId];
    setStoredMappings(allMappings);
}
