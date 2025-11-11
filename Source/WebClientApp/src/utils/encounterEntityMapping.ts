export type EncounterEntityType = 'assets' | 'walls' | 'regions' | 'sources' | 'effects';

const STORAGE_KEY = 'encounter-mappings';

interface EntityTypeMappings {
    assets: Record<string, number>;
    walls: Record<string, number>;
    regions: Record<string, number>;
    sources: Record<string, number>;
    effects: Record<string, number>;
}

interface EncounterMappings {
    [encounterId: string]: EntityTypeMappings;
}

function validateId(id: string, fieldName: string): void {
    if (!id || typeof id !== 'string') {
        throw new Error(`Invalid ${fieldName}: must be non-empty string`);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error(`Invalid ${fieldName}: contains illegal characters`);
    }
}

function isEncounterMappings(value: unknown): value is EncounterMappings {
    if (!value || typeof value !== 'object') return false;

    const obj = value as Record<string, unknown>;
    for (const encounterId in obj) {
        const encounterMappings = obj[encounterId];
        if (!encounterMappings || typeof encounterMappings !== 'object') return false;

        const mappings = encounterMappings as Record<string, unknown>;
        const requiredTypes: EncounterEntityType[] = ['assets', 'walls', 'regions', 'sources', 'effects'];
        for (const type of requiredTypes) {
            if (!(type in mappings) || typeof mappings[type] !== 'object') return false;
        }
    }
    return true;
}

function getStoredMappings(): EncounterMappings {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return {};
        }
        const parsed = JSON.parse(data);
        if (!isEncounterMappings(parsed)) {
            console.error('Corrupted encounter mappings data in localStorage');
            return {};
        }
        return parsed;
    } catch (error) {
        console.error('Failed to read encounter mappings from localStorage:', error);
        return {};
    }
}

function setStoredMappings(mappings: EncounterMappings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    } catch (error) {
        console.error('Failed to save encounter mappings to localStorage:', error);
    }
}

function getEncounterMappings(encounterId: string): EntityTypeMappings {
    validateId(encounterId, 'encounterId');
    const allMappings = getStoredMappings();
    return allMappings[encounterId] ?? {
        assets: {},
        walls: {},
        regions: {},
        sources: {},
        effects: {}
    };
}

function setEncounterMappings(encounterId: string, mappings: EntityTypeMappings): void {
    validateId(encounterId, 'encounterId');
    const allMappings = getStoredMappings();
    allMappings[encounterId] = mappings;
    setStoredMappings(allMappings);
}

export function setEntityMapping(
    encounterId: string,
    entityType: EncounterEntityType,
    domId: string,
    index: number
): void {
    validateId(encounterId, 'encounterId');
    validateId(domId, 'domId');
    const encounterMappings = getEncounterMappings(encounterId);
    encounterMappings[entityType][domId] = index;
    setEncounterMappings(encounterId, encounterMappings);
}

export function getIndexByDomId(
    encounterId: string,
    entityType: EncounterEntityType,
    domId: string
): number | undefined {
    validateId(encounterId, 'encounterId');
    validateId(domId, 'domId');
    const encounterMappings = getEncounterMappings(encounterId);
    return encounterMappings[entityType][domId];
}

export function getDomIdByIndex(
    encounterId: string,
    entityType: EncounterEntityType,
    index: number
): string | undefined {
    validateId(encounterId, 'encounterId');
    const encounterMappings = getEncounterMappings(encounterId);
    const entries = Object.entries(encounterMappings[entityType]);
    const entry = entries.find(([, idx]) => idx === index);
    return entry?.[0];
}

export function removeEntityMapping(
    encounterId: string,
    entityType: EncounterEntityType,
    domId: string
): void {
    validateId(encounterId, 'encounterId');
    validateId(domId, 'domId');
    const encounterMappings = getEncounterMappings(encounterId);
    delete encounterMappings[entityType][domId];
    setEncounterMappings(encounterId, encounterMappings);
}

export function getAllMappings(
    encounterId: string,
    entityType: EncounterEntityType
): Record<string, number> {
    validateId(encounterId, 'encounterId');
    const encounterMappings = getEncounterMappings(encounterId);
    return { ...encounterMappings[entityType] };
}

export function clearEncounterMappings(encounterId: string): void {
    validateId(encounterId, 'encounterId');
    const allMappings = getStoredMappings();
    delete allMappings[encounterId];
    setStoredMappings(allMappings);
}
