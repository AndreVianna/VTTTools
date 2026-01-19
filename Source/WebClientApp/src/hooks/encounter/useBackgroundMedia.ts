import { useMemo } from 'react';
import { getApiEndpoints } from '@/config/development';
import type { Encounter } from '@/types/domain';

export interface UseBackgroundMediaProps {
    encounter: Encounter | undefined;
}

export interface UseBackgroundMediaResult {
    /** URL to the main background media, or undefined if not set */
    backgroundUrl: string | undefined;
    /** Content type of the main background (e.g., 'image/jpeg', 'video/mp4') */
    backgroundContentType: string | undefined;
    /** URL to the alternate background media, or undefined if not set */
    alternateBackgroundUrl: string | undefined;
    /** Content type of the alternate background */
    alternateBackgroundContentType: string | undefined;
}

/**
 * Hook to compute background URL and content type from encounter data.
 * Extracts media URLs from encounter.stage.settings.mainBackground and alternateBackground.
 *
 * @example
 * const { backgroundUrl, backgroundContentType } = useBackgroundMedia({ encounter });
 *
 * <BackgroundLayer
 *     imageUrl={backgroundUrl ?? DEFAULT_BACKGROUNDS.ENCOUNTER}
 *     contentType={backgroundContentType}
 * />
 */
export const useBackgroundMedia = ({ encounter }: UseBackgroundMediaProps): UseBackgroundMediaResult => {
    const backgroundUrl = useMemo(() => {
        if (encounter?.stage?.settings?.mainBackground) {
            return `${getApiEndpoints().media}/${encounter.stage.settings.mainBackground.id}`;
        }
        return undefined;
    }, [encounter?.stage?.settings?.mainBackground]);

    const backgroundContentType = useMemo(
        () => encounter?.stage?.settings?.mainBackground?.contentType,
        [encounter?.stage?.settings?.mainBackground?.contentType]
    );

    const alternateBackgroundUrl = useMemo(() => {
        if (encounter?.stage?.settings?.alternateBackground) {
            return `${getApiEndpoints().media}/${encounter.stage.settings.alternateBackground.id}`;
        }
        return undefined;
    }, [encounter?.stage?.settings?.alternateBackground]);

    const alternateBackgroundContentType = useMemo(
        () => encounter?.stage?.settings?.alternateBackground?.contentType,
        [encounter?.stage?.settings?.alternateBackground?.contentType]
    );

    return {
        backgroundUrl,
        backgroundContentType,
        alternateBackgroundUrl,
        alternateBackgroundContentType,
    };
};
