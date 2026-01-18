import type { Encounter } from '@/types/domain';

/**
 * Creates a wrapper around RTK Query refetch that returns data in a consistent format.
 * This pattern is used throughout the encounter editor to bridge RTK Query's refetch
 * with hooks that expect { data?: Encounter } return type.
 *
 * @param refetch - RTK Query refetch function
 * @returns Wrapped refetch that returns { data?: Encounter }
 */
export const createEncounterRefetch = (
    refetch: () => Promise<{ data?: Encounter }>
): (() => Promise<{ data?: Encounter }>) => {
    return async () => {
        const result = await refetch();
        return result.data ? { data: result.data } : {};
    };
};

/**
 * Creates a void refetch wrapper for hooks that don't need the return value.
 *
 * @param refetch - RTK Query refetch function
 * @returns Wrapped refetch that returns void
 */
export const createVoidRefetch = (
    refetch: () => Promise<unknown>
): (() => Promise<void>) => {
    return async () => {
        await refetch();
    };
};
