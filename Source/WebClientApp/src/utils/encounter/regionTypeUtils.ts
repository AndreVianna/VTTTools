import { type EncounterRegion, RegionType } from '@/types/domain';

/**
 * Converts a string type to RegionType enum.
 * Falls back to Terrain if the type is not a valid RegionType.
 *
 * @param type - The string type to convert
 * @returns The corresponding RegionType enum value
 */
export function toRegionType(type: string): RegionType {
    if (Object.values(RegionType).includes(type as RegionType)) {
        return type as RegionType;
    }
    return RegionType.Terrain;
}

/**
 * Casts an array of regions with a specific encounterId.
 * Useful when converting generic regions to encounter-specific regions.
 *
 * @param regions - Array of regions to cast
 * @param encounterId - The encounter ID to associate
 * @returns Array of EncounterRegion with the encounterId
 */
export function castRegionsWithEncounterId(
    regions: Array<Omit<EncounterRegion, 'encounterId'>>,
    encounterId: string,
): EncounterRegion[] {
    return regions.map((region) => ({
        ...region,
        encounterId,
    }));
}
