export type EncounterEntityType =
  | 'assets'
  | 'actors'
  | 'objects'
  | 'effects'
  | 'walls'
  | 'regions'
  | 'lightSources'
  | 'soundSources';

const STORAGE_KEY = 'encounter-mappings';
const MAX_ID_GENERATION_ATTEMPTS = 10;

const usedIds = new Set<string>();

interface EntityTypeMappings {
  assets: Record<string, number>;
  actors: Record<string, number>;
  objects: Record<string, number>;
  effects: Record<string, number>;
  walls: Record<string, number>;
  regions: Record<string, number>;
  lightSources: Record<string, number>;
  soundSources: Record<string, number>;
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

// Validates basic structure - allows partial data that will be migrated
function isValidEncounterMappingsStructure(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;
  for (const encounterId in obj) {
    const encounterMappings = obj[encounterId];
    if (!encounterMappings || typeof encounterMappings !== 'object') return false;
    // Allow partial data - missing keys will be added during migration
  }
  return true;
}

// Migrates old localStorage data to include new entity types
function migrateEncounterMappings(data: Record<string, unknown>): EncounterMappings {
  const migrated: EncounterMappings = {};
  const allTypes: EncounterEntityType[] = [
    'assets',
    'actors',
    'objects',
    'effects',
    'walls',
    'regions',
    'lightSources',
    'soundSources',
  ];

  for (const encounterId in data) {
    const encounterData = data[encounterId] as Record<string, unknown> | undefined;
    if (!encounterData || typeof encounterData !== 'object') continue;

    const entityMappings: EntityTypeMappings = {
      assets: {},
      actors: {},
      objects: {},
      effects: {},
      walls: {},
      regions: {},
      lightSources: {},
      soundSources: {},
    };

    // Preserve existing data
    for (const type of allTypes) {
      if (type in encounterData && typeof encounterData[type] === 'object' && encounterData[type] !== null) {
        entityMappings[type] = encounterData[type] as Record<string, number>;
      }
    }

    migrated[encounterId] = entityMappings;
  }

  return migrated;
}

function getStoredMappings(): EncounterMappings {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {};
    }
    const parsed = JSON.parse(data);
    if (!isValidEncounterMappingsStructure(parsed)) {
      console.warn('Invalid encounter mappings structure in localStorage, resetting');
      return {};
    }
    // Migrate old data to include new entity types
    return migrateEncounterMappings(parsed as Record<string, unknown>);
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
  return (
    allMappings[encounterId] ?? {
      assets: {},
      actors: {},
      objects: {},
      effects: {},
      walls: {},
      regions: {},
      lightSources: {},
      soundSources: {},
    }
  );
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
  index: number,
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
  domId: string,
): number | undefined {
  validateId(encounterId, 'encounterId');
  validateId(domId, 'domId');
  const encounterMappings = getEncounterMappings(encounterId);
  const typeMapping = encounterMappings[entityType];
  if (!typeMapping) return undefined;
  return typeMapping[domId];
}

export function getDomIdByIndex(
  encounterId: string,
  entityType: EncounterEntityType,
  index: number,
): string | undefined {
  validateId(encounterId, 'encounterId');
  const encounterMappings = getEncounterMappings(encounterId);
  const typeMapping = encounterMappings[entityType];
  if (!typeMapping) return undefined;
  const entries = Object.entries(typeMapping);
  const entry = entries.find(([, idx]) => idx === index);
  return entry?.[0];
}

export function removeEntityMapping(encounterId: string, entityType: EncounterEntityType, domId: string): void {
  validateId(encounterId, 'encounterId');
  validateId(domId, 'domId');
  const encounterMappings = getEncounterMappings(encounterId);
  delete encounterMappings[entityType][domId];
  setEncounterMappings(encounterId, encounterMappings);
  usedIds.delete(domId);
}

export function getAllMappings(encounterId: string, entityType: EncounterEntityType): Record<string, number> {
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

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateUniqueId(prefix: string, entityType: EncounterEntityType): string {
  for (let attempt = 0; attempt < MAX_ID_GENERATION_ATTEMPTS; attempt++) {
    const uuid = generateUUID();
    const id = `${prefix}-${uuid}`;

    if (!usedIds.has(id)) {
      usedIds.add(id);
      return id;
    }
  }

  throw new Error(
    `Failed to generate unique ID after ${MAX_ID_GENERATION_ATTEMPTS} attempts for ${entityType} with prefix "${prefix}"`,
  );
}
