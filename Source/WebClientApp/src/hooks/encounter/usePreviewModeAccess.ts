import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Encounter } from '@/types/domain';

/**
 * Result of the preview mode access check.
 */
export interface UsePreviewModeAccessResult {
    /** Whether the current user has access to preview mode */
    hasAccess: boolean;
    /** Whether the access check is still loading */
    isLoading: boolean;
    /** Error message if access is denied */
    error: string | null;
}

/**
 * Hook to validate user access to preview mode.
 *
 * Phase A (current): Simple ownership check - user must own the encounter.
 * Phase B (future): Will add session validation, participant check, etc.
 *
 * @param encounterId - The ID of the encounter
 * @param encounter - The encounter data (or undefined if not loaded)
 * @returns Access check result
 */
export function usePreviewModeAccess(
    encounterId: string | undefined,
    encounter: Encounter | undefined
): UsePreviewModeAccessResult {
    const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

    const result = useMemo((): UsePreviewModeAccessResult => {
        // Still loading auth or encounter
        if (isAuthLoading || !encounter) {
            return {
                hasAccess: false,
                isLoading: true,
                error: null,
            };
        }

        // Not authenticated
        if (!isAuthenticated || !user) {
            return {
                hasAccess: false,
                isLoading: false,
                error: 'You must be logged in to preview encounters.',
            };
        }

        // No encounter ID provided
        if (!encounterId) {
            return {
                hasAccess: false,
                isLoading: false,
                error: 'No encounter specified.',
            };
        }

        // Check ownership (Phase A: simple ownership check)
        const hasAccess = encounter.ownerId === user.id;

        if (!hasAccess) {
            return {
                hasAccess: false,
                isLoading: false,
                error: 'You do not have permission to preview this encounter.',
            };
        }

        return {
            hasAccess: true,
            isLoading: false,
            error: null,
        };
    }, [encounterId, encounter, user, isAuthLoading, isAuthenticated]);

    return result;
}
