import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    setEntityMapping,
    getIndexByDomId,
    getDomIdByIndex,
    removeEntityMapping,
    getAllMappings,
    clearSceneMappings,
    type SceneEntityType
} from './sceneEntityMapping';

describe('sceneEntityMapping', () => {
    const testSceneId = 'test-scene-123';
    const testDomId = 'dom-element-456';
    const testEntityType: SceneEntityType = 'assets';
    const testIndex = 0;

    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe('setEntityMapping and getIndexByDomId', () => {
        it('should store and retrieve entity mapping', () => {
            setEntityMapping(testSceneId, testEntityType, testDomId, testIndex);

            const retrievedIndex = getIndexByDomId(testSceneId, testEntityType, testDomId);

            expect(retrievedIndex).toBe(testIndex);
        });

        it('should handle multiple mappings for same scene', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 0);
            setEntityMapping(testSceneId, testEntityType, 'dom-2', 1);
            setEntityMapping(testSceneId, testEntityType, 'dom-3', 2);

            expect(getIndexByDomId(testSceneId, testEntityType, 'dom-1')).toBe(0);
            expect(getIndexByDomId(testSceneId, testEntityType, 'dom-2')).toBe(1);
            expect(getIndexByDomId(testSceneId, testEntityType, 'dom-3')).toBe(2);
        });

        it('should handle multiple entity types for same scene', () => {
            setEntityMapping(testSceneId, 'assets', 'dom-1', 0);
            setEntityMapping(testSceneId, 'walls', 'dom-2', 1);
            setEntityMapping(testSceneId, 'regions', 'dom-3', 2);

            expect(getIndexByDomId(testSceneId, 'assets', 'dom-1')).toBe(0);
            expect(getIndexByDomId(testSceneId, 'walls', 'dom-2')).toBe(1);
            expect(getIndexByDomId(testSceneId, 'regions', 'dom-3')).toBe(2);
        });

        it('should handle multiple scenes independently', () => {
            setEntityMapping('scene-1', testEntityType, 'dom-1', 0);
            setEntityMapping('scene-2', testEntityType, 'dom-2', 1);

            expect(getIndexByDomId('scene-1', testEntityType, 'dom-1')).toBe(0);
            expect(getIndexByDomId('scene-2', testEntityType, 'dom-2')).toBe(1);
            expect(getIndexByDomId('scene-1', testEntityType, 'dom-2')).toBeUndefined();
        });

        it('should update existing mapping', () => {
            setEntityMapping(testSceneId, testEntityType, testDomId, 0);
            setEntityMapping(testSceneId, testEntityType, testDomId, 5);

            const retrievedIndex = getIndexByDomId(testSceneId, testEntityType, testDomId);

            expect(retrievedIndex).toBe(5);
        });

        it('should return undefined for non-existent mapping', () => {
            const result = getIndexByDomId(testSceneId, testEntityType, 'nonexistent');

            expect(result).toBeUndefined();
        });
    });

    describe('getDomIdByIndex', () => {
        it('should return correct DOM ID for given index', () => {
            setEntityMapping(testSceneId, testEntityType, testDomId, testIndex);

            const retrievedDomId = getDomIdByIndex(testSceneId, testEntityType, testIndex);

            expect(retrievedDomId).toBe(testDomId);
        });

        it('should return first match when multiple DOM IDs map to same index', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 5);
            setEntityMapping(testSceneId, testEntityType, 'dom-2', 5);

            const retrievedDomId = getDomIdByIndex(testSceneId, testEntityType, 5);

            expect(['dom-1', 'dom-2']).toContain(retrievedDomId);
        });

        it('should return undefined for non-existent index', () => {
            const result = getDomIdByIndex(testSceneId, testEntityType, 999);

            expect(result).toBeUndefined();
        });

        it('should return undefined for empty scene', () => {
            const result = getDomIdByIndex('empty-scene', testEntityType, 0);

            expect(result).toBeUndefined();
        });
    });

    describe('removeEntityMapping', () => {
        it('should remove mapping from scene', () => {
            setEntityMapping(testSceneId, testEntityType, testDomId, testIndex);

            removeEntityMapping(testSceneId, testEntityType, testDomId);

            const retrievedIndex = getIndexByDomId(testSceneId, testEntityType, testDomId);
            expect(retrievedIndex).toBeUndefined();
        });

        it('should not affect other mappings in same entity type', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 0);
            setEntityMapping(testSceneId, testEntityType, 'dom-2', 1);

            removeEntityMapping(testSceneId, testEntityType, 'dom-1');

            expect(getIndexByDomId(testSceneId, testEntityType, 'dom-1')).toBeUndefined();
            expect(getIndexByDomId(testSceneId, testEntityType, 'dom-2')).toBe(1);
        });

        it('should not affect other entity types', () => {
            setEntityMapping(testSceneId, 'assets', 'dom-1', 0);
            setEntityMapping(testSceneId, 'walls', 'dom-2', 1);

            removeEntityMapping(testSceneId, 'assets', 'dom-1');

            expect(getIndexByDomId(testSceneId, 'assets', 'dom-1')).toBeUndefined();
            expect(getIndexByDomId(testSceneId, 'walls', 'dom-2')).toBe(1);
        });

        it('should handle removal of non-existent mapping', () => {
            expect(() => removeEntityMapping(testSceneId, testEntityType, 'nonexistent')).not.toThrow();
        });
    });

    describe('getAllMappings', () => {
        it('should return all mappings for entity type', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 0);
            setEntityMapping(testSceneId, testEntityType, 'dom-2', 1);
            setEntityMapping(testSceneId, testEntityType, 'dom-3', 2);

            const mappings = getAllMappings(testSceneId, testEntityType);

            expect(mappings).toEqual({
                'dom-1': 0,
                'dom-2': 1,
                'dom-3': 2
            });
        });

        it('should return empty object for entity type with no mappings', () => {
            const mappings = getAllMappings(testSceneId, testEntityType);

            expect(mappings).toEqual({});
        });

        it('should return independent copy of mappings', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 0);

            const mappings1 = getAllMappings(testSceneId, testEntityType);
            const mappings2 = getAllMappings(testSceneId, testEntityType);

            expect(mappings1).toEqual(mappings2);
            expect(mappings1).not.toBe(mappings2);
        });

        it('should not include other entity types', () => {
            setEntityMapping(testSceneId, 'assets', 'dom-1', 0);
            setEntityMapping(testSceneId, 'walls', 'dom-2', 1);

            const assetMappings = getAllMappings(testSceneId, 'assets');

            expect(assetMappings).toEqual({ 'dom-1': 0 });
        });
    });

    describe('clearSceneMappings', () => {
        it('should remove all mappings for scene', () => {
            setEntityMapping(testSceneId, 'assets', 'dom-1', 0);
            setEntityMapping(testSceneId, 'walls', 'dom-2', 1);
            setEntityMapping(testSceneId, 'regions', 'dom-3', 2);

            clearSceneMappings(testSceneId);

            expect(getAllMappings(testSceneId, 'assets')).toEqual({});
            expect(getAllMappings(testSceneId, 'walls')).toEqual({});
            expect(getAllMappings(testSceneId, 'regions')).toEqual({});
        });

        it('should not affect other scenes', () => {
            setEntityMapping('scene-1', testEntityType, 'dom-1', 0);
            setEntityMapping('scene-2', testEntityType, 'dom-2', 1);

            clearSceneMappings('scene-1');

            expect(getAllMappings('scene-1', testEntityType)).toEqual({});
            expect(getAllMappings('scene-2', testEntityType)).toEqual({ 'dom-2': 1 });
        });

        it('should handle clearing non-existent scene', () => {
            expect(() => clearSceneMappings('nonexistent-scene')).not.toThrow();
        });
    });

    describe('input validation', () => {
        describe('sceneId validation', () => {
            it('should throw error for empty sceneId', () => {
                expect(() => setEntityMapping('', testEntityType, testDomId, testIndex))
                    .toThrow('Invalid sceneId: must be non-empty string');
            });

            it('should throw error for invalid sceneId type', () => {
                expect(() => setEntityMapping(null as any, testEntityType, testDomId, testIndex))
                    .toThrow('Invalid sceneId: must be non-empty string');
            });

            it('should throw error for sceneId with illegal characters', () => {
                expect(() => setEntityMapping('scene<script>', testEntityType, testDomId, testIndex))
                    .toThrow('Invalid sceneId: contains illegal characters');

                expect(() => setEntityMapping('scene id', testEntityType, testDomId, testIndex))
                    .toThrow('Invalid sceneId: contains illegal characters');

                expect(() => setEntityMapping('scene@id', testEntityType, testDomId, testIndex))
                    .toThrow('Invalid sceneId: contains illegal characters');
            });

            it('should accept valid sceneId with alphanumeric, hyphens, and underscores', () => {
                expect(() => setEntityMapping('valid-scene_123', testEntityType, testDomId, testIndex))
                    .not.toThrow();
            });
        });

        describe('domId validation', () => {
            it('should throw error for empty domId', () => {
                expect(() => setEntityMapping(testSceneId, testEntityType, '', testIndex))
                    .toThrow('Invalid domId: must be non-empty string');
            });

            it('should throw error for invalid domId type', () => {
                expect(() => setEntityMapping(testSceneId, testEntityType, undefined as any, testIndex))
                    .toThrow('Invalid domId: must be non-empty string');
            });

            it('should throw error for domId with illegal characters', () => {
                expect(() => setEntityMapping(testSceneId, testEntityType, 'dom<img src=x>', testIndex))
                    .toThrow('Invalid domId: contains illegal characters');

                expect(() => setEntityMapping(testSceneId, testEntityType, 'dom id', testIndex))
                    .toThrow('Invalid domId: contains illegal characters');
            });

            it('should accept valid domId with alphanumeric, hyphens, and underscores', () => {
                expect(() => setEntityMapping(testSceneId, testEntityType, 'valid-dom_456', testIndex))
                    .not.toThrow();
            });
        });

        describe('validation in all functions', () => {
            it('should validate sceneId in getIndexByDomId', () => {
                expect(() => getIndexByDomId('invalid scene', testEntityType, testDomId))
                    .toThrow('Invalid sceneId: contains illegal characters');
            });

            it('should validate domId in getIndexByDomId', () => {
                expect(() => getIndexByDomId(testSceneId, testEntityType, 'invalid dom'))
                    .toThrow('Invalid domId: contains illegal characters');
            });

            it('should validate sceneId in getDomIdByIndex', () => {
                expect(() => getDomIdByIndex('', testEntityType, 0))
                    .toThrow('Invalid sceneId: must be non-empty string');
            });

            it('should validate sceneId in removeEntityMapping', () => {
                expect(() => removeEntityMapping('invalid@scene', testEntityType, testDomId))
                    .toThrow('Invalid sceneId: contains illegal characters');
            });

            it('should validate domId in removeEntityMapping', () => {
                expect(() => removeEntityMapping(testSceneId, testEntityType, 'invalid@dom'))
                    .toThrow('Invalid domId: contains illegal characters');
            });

            it('should validate sceneId in getAllMappings', () => {
                expect(() => getAllMappings('', testEntityType))
                    .toThrow('Invalid sceneId: must be non-empty string');
            });

            it('should validate sceneId in clearSceneMappings', () => {
                expect(() => clearSceneMappings('invalid scene'))
                    .toThrow('Invalid sceneId: contains illegal characters');
            });
        });
    });

    describe('corrupted localStorage data', () => {
        it('should return empty object for corrupted data', () => {
            localStorage.setItem('scene-mappings', 'invalid json {');

            const result = getAllMappings(testSceneId, testEntityType);

            expect(result).toEqual({});
        });

        it('should return empty object for data with wrong structure', () => {
            localStorage.setItem('scene-mappings', JSON.stringify({
                'scene-1': {
                    assets: 'not an object'
                }
            }));

            const result = getAllMappings('scene-1', testEntityType);

            expect(result).toEqual({});
        });

        it('should return empty object for data missing required entity types', () => {
            localStorage.setItem('scene-mappings', JSON.stringify({
                'scene-1': {
                    assets: {},
                    walls: {}
                }
            }));

            const result = getAllMappings('scene-1', testEntityType);

            expect(result).toEqual({});
        });

        it('should log error for corrupted data', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            localStorage.setItem('scene-mappings', JSON.stringify({ invalid: 'structure' }));

            getAllMappings(testSceneId, testEntityType);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Corrupted scene mappings data in localStorage');
        });
    });

    describe('non-existent scene', () => {
        it('should return empty mappings for non-existent scene', () => {
            const mappings = getAllMappings('nonexistent-scene', testEntityType);

            expect(mappings).toEqual({});
        });

        it('should return undefined when querying non-existent scene by domId', () => {
            const result = getIndexByDomId('nonexistent-scene', testEntityType, testDomId);

            expect(result).toBeUndefined();
        });

        it('should return undefined when querying non-existent scene by index', () => {
            const result = getDomIdByIndex('nonexistent-scene', testEntityType, 0);

            expect(result).toBeUndefined();
        });
    });

    describe('localStorage persistence', () => {
        it('should persist mappings across multiple operations', () => {
            setEntityMapping(testSceneId, testEntityType, 'dom-1', 0);
            setEntityMapping(testSceneId, testEntityType, 'dom-2', 1);

            const stored = localStorage.getItem('scene-mappings');
            expect(stored).toBeTruthy();

            const parsed = JSON.parse(stored!);
            expect(parsed[testSceneId][testEntityType]).toEqual({
                'dom-1': 0,
                'dom-2': 1
            });
        });

        it('should handle localStorage errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage error');
            });

            expect(() => setEntityMapping(testSceneId, testEntityType, testDomId, testIndex))
                .not.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to save scene mappings to localStorage:',
                expect.any(Error)
            );
        });
    });
});
