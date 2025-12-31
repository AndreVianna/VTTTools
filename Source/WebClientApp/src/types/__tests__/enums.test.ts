import { describe, it, expect } from 'vitest';
import { AdventureStyle, AssetKind, Weather, GridType } from '../domain';

/**
 * These tests validate that TypeScript enums use string values matching the backend.
 *
 * BACKGROUND: The backend serializes C# enums as strings via JsonStringEnumConverter.
 * If frontend enums use numeric values (e.g., `OpenWorld = 1`), MUI Select will fail
 * with "out-of-range value" errors when receiving string values from the API.
 *
 * RULE: All enums received from the API MUST use string values equal to the member name.
 *
 * NOTE: ContentType is NOT tested here as it's currently frontend-only (not in API responses).
 */

describe('Enum String Serialization', () => {
    describe('AdventureStyle', () => {
        it('should use string values matching member names', () => {
            // All values must be strings, not numbers
            expect(typeof AdventureStyle.Generic).toBe('string');
            expect(typeof AdventureStyle.OpenWorld).toBe('string');
            expect(typeof AdventureStyle.DungeonCrawl).toBe('string');
            expect(typeof AdventureStyle.HackNSlash).toBe('string');
            expect(typeof AdventureStyle.Survival).toBe('string');
            expect(typeof AdventureStyle.GoalDriven).toBe('string');
            expect(typeof AdventureStyle.RandomlyGenerated).toBe('string');

            // Values must equal the member name (backend serialization format)
            expect(AdventureStyle.Generic).toBe('Generic');
            expect(AdventureStyle.OpenWorld).toBe('OpenWorld');
            expect(AdventureStyle.DungeonCrawl).toBe('DungeonCrawl');
            expect(AdventureStyle.HackNSlash).toBe('HackNSlash');
            expect(AdventureStyle.Survival).toBe('Survival');
            expect(AdventureStyle.GoalDriven).toBe('GoalDriven');
            expect(AdventureStyle.RandomlyGenerated).toBe('RandomlyGenerated');
        });

        it('should be usable in MUI Select value matching', () => {
            // Simulates backend API response
            const apiValue = 'OpenWorld';
            // Should match the enum value directly
            expect(apiValue).toBe(AdventureStyle.OpenWorld);
        });
    });

    describe('AssetKind', () => {
        it('should use string values matching member names', () => {
            expect(typeof AssetKind.Character).toBe('string');
            expect(typeof AssetKind.Creature).toBe('string');
            expect(typeof AssetKind.Effect).toBe('string');
            expect(typeof AssetKind.Object).toBe('string');

            expect(AssetKind.Character).toBe('Character');
            expect(AssetKind.Creature).toBe('Creature');
            expect(AssetKind.Effect).toBe('Effect');
            expect(AssetKind.Object).toBe('Object');
        });
    });

    describe('Weather', () => {
        it('should use string values matching member names', () => {
            expect(typeof Weather.Clear).toBe('string');
            expect(Weather.Clear).toBe('Clear');
            expect(Weather.Thunderstorm).toBe('Thunderstorm');
            expect(Weather.Hurricane).toBe('Hurricane');
        });
    });

    describe('GridType', () => {
        it('should use string values matching member names', () => {
            expect(typeof GridType.NoGrid).toBe('string');
            expect(GridType.NoGrid).toBe('NoGrid');
        });
    });
});
