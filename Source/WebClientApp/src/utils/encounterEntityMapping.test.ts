import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearEncounterMappings,
  type EncounterEntityType,
  getAllMappings,
  getDomIdByIndex,
  getIndexByDomId,
  removeEntityMapping,
  setEntityMapping,
} from './encounterEntityMapping';

describe('encounterEntityMapping', () => {
  const testEncounterId = 'test-encounter-123';
  const testDomId = 'dom-element-456';
  const testEntityType: EncounterEntityType = 'assets';
  const testIndex = 0;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('setEntityMapping and getIndexByDomId', () => {
    it('should store and retrieve entity mapping', () => {
      setEntityMapping(testEncounterId, testEntityType, testDomId, testIndex);

      const retrievedIndex = getIndexByDomId(testEncounterId, testEntityType, testDomId);

      expect(retrievedIndex).toBe(testIndex);
    });

    it('should handle multiple mappings for same encounter', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 0);
      setEntityMapping(testEncounterId, testEntityType, 'dom-2', 1);
      setEntityMapping(testEncounterId, testEntityType, 'dom-3', 2);

      expect(getIndexByDomId(testEncounterId, testEntityType, 'dom-1')).toBe(0);
      expect(getIndexByDomId(testEncounterId, testEntityType, 'dom-2')).toBe(1);
      expect(getIndexByDomId(testEncounterId, testEntityType, 'dom-3')).toBe(2);
    });

    it('should handle multiple entity types for same encounter', () => {
      setEntityMapping(testEncounterId, 'assets', 'dom-1', 0);
      setEntityMapping(testEncounterId, 'walls', 'dom-2', 1);
      setEntityMapping(testEncounterId, 'regions', 'dom-3', 2);

      expect(getIndexByDomId(testEncounterId, 'assets', 'dom-1')).toBe(0);
      expect(getIndexByDomId(testEncounterId, 'walls', 'dom-2')).toBe(1);
      expect(getIndexByDomId(testEncounterId, 'regions', 'dom-3')).toBe(2);
    });

    it('should handle multiple encounters independently', () => {
      setEntityMapping('encounter-1', testEntityType, 'dom-1', 0);
      setEntityMapping('encounter-2', testEntityType, 'dom-2', 1);

      expect(getIndexByDomId('encounter-1', testEntityType, 'dom-1')).toBe(0);
      expect(getIndexByDomId('encounter-2', testEntityType, 'dom-2')).toBe(1);
      expect(getIndexByDomId('encounter-1', testEntityType, 'dom-2')).toBeUndefined();
    });

    it('should update existing mapping', () => {
      setEntityMapping(testEncounterId, testEntityType, testDomId, 0);
      setEntityMapping(testEncounterId, testEntityType, testDomId, 5);

      const retrievedIndex = getIndexByDomId(testEncounterId, testEntityType, testDomId);

      expect(retrievedIndex).toBe(5);
    });

    it('should return undefined for non-existent mapping', () => {
      const result = getIndexByDomId(testEncounterId, testEntityType, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('getDomIdByIndex', () => {
    it('should return correct DOM ID for given index', () => {
      setEntityMapping(testEncounterId, testEntityType, testDomId, testIndex);

      const retrievedDomId = getDomIdByIndex(testEncounterId, testEntityType, testIndex);

      expect(retrievedDomId).toBe(testDomId);
    });

    it('should return first match when multiple DOM IDs map to same index', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 5);
      setEntityMapping(testEncounterId, testEntityType, 'dom-2', 5);

      const retrievedDomId = getDomIdByIndex(testEncounterId, testEntityType, 5);

      expect(['dom-1', 'dom-2']).toContain(retrievedDomId);
    });

    it('should return undefined for non-existent index', () => {
      const result = getDomIdByIndex(testEncounterId, testEntityType, 999);

      expect(result).toBeUndefined();
    });

    it('should return undefined for empty encounter', () => {
      const result = getDomIdByIndex('empty-encounter', testEntityType, 0);

      expect(result).toBeUndefined();
    });
  });

  describe('removeEntityMapping', () => {
    it('should remove mapping from encounter', () => {
      setEntityMapping(testEncounterId, testEntityType, testDomId, testIndex);

      removeEntityMapping(testEncounterId, testEntityType, testDomId);

      const retrievedIndex = getIndexByDomId(testEncounterId, testEntityType, testDomId);
      expect(retrievedIndex).toBeUndefined();
    });

    it('should not affect other mappings in same entity type', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 0);
      setEntityMapping(testEncounterId, testEntityType, 'dom-2', 1);

      removeEntityMapping(testEncounterId, testEntityType, 'dom-1');

      expect(getIndexByDomId(testEncounterId, testEntityType, 'dom-1')).toBeUndefined();
      expect(getIndexByDomId(testEncounterId, testEntityType, 'dom-2')).toBe(1);
    });

    it('should not affect other entity types', () => {
      setEntityMapping(testEncounterId, 'assets', 'dom-1', 0);
      setEntityMapping(testEncounterId, 'walls', 'dom-2', 1);

      removeEntityMapping(testEncounterId, 'assets', 'dom-1');

      expect(getIndexByDomId(testEncounterId, 'assets', 'dom-1')).toBeUndefined();
      expect(getIndexByDomId(testEncounterId, 'walls', 'dom-2')).toBe(1);
    });

    it('should handle removal of non-existent mapping', () => {
      expect(() => removeEntityMapping(testEncounterId, testEntityType, 'nonexistent')).not.toThrow();
    });
  });

  describe('getAllMappings', () => {
    it('should return all mappings for entity type', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 0);
      setEntityMapping(testEncounterId, testEntityType, 'dom-2', 1);
      setEntityMapping(testEncounterId, testEntityType, 'dom-3', 2);

      const mappings = getAllMappings(testEncounterId, testEntityType);

      expect(mappings).toEqual({
        'dom-1': 0,
        'dom-2': 1,
        'dom-3': 2,
      });
    });

    it('should return empty object for entity type with no mappings', () => {
      const mappings = getAllMappings(testEncounterId, testEntityType);

      expect(mappings).toEqual({});
    });

    it('should return independent copy of mappings', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 0);

      const mappings1 = getAllMappings(testEncounterId, testEntityType);
      const mappings2 = getAllMappings(testEncounterId, testEntityType);

      expect(mappings1).toEqual(mappings2);
      expect(mappings1).not.toBe(mappings2);
    });

    it('should not include other entity types', () => {
      setEntityMapping(testEncounterId, 'assets', 'dom-1', 0);
      setEntityMapping(testEncounterId, 'walls', 'dom-2', 1);

      const assetMappings = getAllMappings(testEncounterId, 'assets');

      expect(assetMappings).toEqual({ 'dom-1': 0 });
    });
  });

  describe('clearEncounterMappings', () => {
    it('should remove all mappings for encounter', () => {
      setEntityMapping(testEncounterId, 'assets', 'dom-1', 0);
      setEntityMapping(testEncounterId, 'walls', 'dom-2', 1);
      setEntityMapping(testEncounterId, 'regions', 'dom-3', 2);

      clearEncounterMappings(testEncounterId);

      expect(getAllMappings(testEncounterId, 'assets')).toEqual({});
      expect(getAllMappings(testEncounterId, 'walls')).toEqual({});
      expect(getAllMappings(testEncounterId, 'regions')).toEqual({});
    });

    it('should not affect other encounters', () => {
      setEntityMapping('encounter-1', testEntityType, 'dom-1', 0);
      setEntityMapping('encounter-2', testEntityType, 'dom-2', 1);

      clearEncounterMappings('encounter-1');

      expect(getAllMappings('encounter-1', testEntityType)).toEqual({});
      expect(getAllMappings('encounter-2', testEntityType)).toEqual({
        'dom-2': 1,
      });
    });

    it('should handle clearing non-existent encounter', () => {
      expect(() => clearEncounterMappings('nonexistent-encounter')).not.toThrow();
    });
  });

  describe('input validation', () => {
    describe('encounterId validation', () => {
      it('should throw error for empty encounterId', () => {
        expect(() => setEntityMapping('', testEntityType, testDomId, testIndex)).toThrow(
          'Invalid encounterId: must be non-empty string',
        );
      });

      it('should throw error for invalid encounterId type', () => {
        expect(() => setEntityMapping(null as unknown as string, testEntityType, testDomId, testIndex)).toThrow(
          'Invalid encounterId: must be non-empty string',
        );
      });

      it('should throw error for encounterId with illegal characters', () => {
        expect(() => setEntityMapping('encounter<script>', testEntityType, testDomId, testIndex)).toThrow(
          'Invalid encounterId: contains illegal characters',
        );

        expect(() => setEntityMapping('encounter id', testEntityType, testDomId, testIndex)).toThrow(
          'Invalid encounterId: contains illegal characters',
        );

        expect(() => setEntityMapping('encounter@id', testEntityType, testDomId, testIndex)).toThrow(
          'Invalid encounterId: contains illegal characters',
        );
      });

      it('should accept valid encounterId with alphanumeric, hyphens, and underscores', () => {
        expect(() => setEntityMapping('valid-encounter_123', testEntityType, testDomId, testIndex)).not.toThrow();
      });
    });

    describe('domId validation', () => {
      it('should throw error for empty domId', () => {
        expect(() => setEntityMapping(testEncounterId, testEntityType, '', testIndex)).toThrow(
          'Invalid domId: must be non-empty string',
        );
      });

      it('should throw error for invalid domId type', () => {
        expect(() =>
          setEntityMapping(testEncounterId, testEntityType, undefined as unknown as string, testIndex),
        ).toThrow('Invalid domId: must be non-empty string');
      });

      it('should throw error for domId with illegal characters', () => {
        expect(() => setEntityMapping(testEncounterId, testEntityType, 'dom<img src=x>', testIndex)).toThrow(
          'Invalid domId: contains illegal characters',
        );

        expect(() => setEntityMapping(testEncounterId, testEntityType, 'dom id', testIndex)).toThrow(
          'Invalid domId: contains illegal characters',
        );
      });

      it('should accept valid domId with alphanumeric, hyphens, and underscores', () => {
        expect(() => setEntityMapping(testEncounterId, testEntityType, 'valid-dom_456', testIndex)).not.toThrow();
      });
    });

    describe('validation in all functions', () => {
      it('should validate encounterId in getIndexByDomId', () => {
        expect(() => getIndexByDomId('invalid encounter', testEntityType, testDomId)).toThrow(
          'Invalid encounterId: contains illegal characters',
        );
      });

      it('should validate domId in getIndexByDomId', () => {
        expect(() => getIndexByDomId(testEncounterId, testEntityType, 'invalid dom')).toThrow(
          'Invalid domId: contains illegal characters',
        );
      });

      it('should validate encounterId in getDomIdByIndex', () => {
        expect(() => getDomIdByIndex('', testEntityType, 0)).toThrow('Invalid encounterId: must be non-empty string');
      });

      it('should validate encounterId in removeEntityMapping', () => {
        expect(() => removeEntityMapping('invalid@encounter', testEntityType, testDomId)).toThrow(
          'Invalid encounterId: contains illegal characters',
        );
      });

      it('should validate domId in removeEntityMapping', () => {
        expect(() => removeEntityMapping(testEncounterId, testEntityType, 'invalid@dom')).toThrow(
          'Invalid domId: contains illegal characters',
        );
      });

      it('should validate encounterId in getAllMappings', () => {
        expect(() => getAllMappings('', testEntityType)).toThrow('Invalid encounterId: must be non-empty string');
      });

      it('should validate encounterId in clearEncounterMappings', () => {
        expect(() => clearEncounterMappings('invalid encounter')).toThrow(
          'Invalid encounterId: contains illegal characters',
        );
      });
    });
  });

  describe('corrupted localStorage data', () => {
    it('should return empty object for corrupted data', () => {
      localStorage.setItem('encounter-mappings', 'invalid json {');

      const result = getAllMappings(testEncounterId, testEntityType);

      expect(result).toEqual({});
    });

    it('should return empty object for data with wrong structure', () => {
      localStorage.setItem(
        'encounter-mappings',
        JSON.stringify({
          'encounter-1': {
            assets: 'not an object',
          },
        }),
      );

      const result = getAllMappings('encounter-1', testEntityType);

      expect(result).toEqual({});
    });

    it('should return empty object for data missing required entity types', () => {
      localStorage.setItem(
        'encounter-mappings',
        JSON.stringify({
          'encounter-1': {
            assets: {},
            walls: {},
          },
        }),
      );

      const result = getAllMappings('encounter-1', testEntityType);

      expect(result).toEqual({});
    });

    it('should log warning for invalid structure', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('encounter-mappings', JSON.stringify({ invalid: 'structure' }));

      getAllMappings(testEncounterId, testEntityType);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid encounter mappings structure in localStorage, resetting');
    });
  });

  describe('non-existent encounter', () => {
    it('should return empty mappings for non-existent encounter', () => {
      const mappings = getAllMappings('nonexistent-encounter', testEntityType);

      expect(mappings).toEqual({});
    });

    it('should return undefined when querying non-existent encounter by domId', () => {
      const result = getIndexByDomId('nonexistent-encounter', testEntityType, testDomId);

      expect(result).toBeUndefined();
    });

    it('should return undefined when querying non-existent encounter by index', () => {
      const result = getDomIdByIndex('nonexistent-encounter', testEntityType, 0);

      expect(result).toBeUndefined();
    });
  });

  describe('localStorage persistence', () => {
    it('should persist mappings across multiple operations', () => {
      setEntityMapping(testEncounterId, testEntityType, 'dom-1', 0);
      setEntityMapping(testEncounterId, testEntityType, 'dom-2', 1);

      const stored = localStorage.getItem('encounter-mappings');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored ?? '{}');
      expect(parsed[testEncounterId][testEntityType]).toEqual({
        'dom-1': 0,
        'dom-2': 1,
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => setEntityMapping(testEncounterId, testEntityType, testDomId, testIndex)).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save encounter mappings to localStorage:',
        expect.any(Error),
      );
    });
  });
});
