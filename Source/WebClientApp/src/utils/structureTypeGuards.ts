import type { Barrier, Region, Source } from '@/types/domain';

export const isBarrier = (structure: Barrier | Region | Source): structure is Barrier => {
    return 'visibility' in structure;
};

export const isRegion = (structure: Barrier | Region | Source): structure is Region => {
    return 'regionType' in structure;
};

export const isSource = (structure: Barrier | Region | Source): structure is Source => {
    return 'sourceType' in structure;
};

isBarrier.displayName = 'isBarrier';
isRegion.displayName = 'isRegion';
isSource.displayName = 'isSource';
