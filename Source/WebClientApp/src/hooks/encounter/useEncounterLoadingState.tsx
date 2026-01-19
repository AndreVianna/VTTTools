import React from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

export interface EncounterLoadingStateProps {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
    hasNoData: boolean;
}

export interface UseEncounterLoadingStateOptions extends EncounterLoadingStateProps {
    onGoBack?: () => void;
    loadingMessage?: string;
    errorMessage?: string;
}

/**
 * Shared loading/error state component for encounter pages.
 * Provides consistent loading spinner and error display with theme-aware styling.
 */
export const EncounterLoadingState: React.FC<UseEncounterLoadingStateOptions> = ({
    isLoading,
    isError,
    error,
    hasNoData,
    onGoBack,
    loadingMessage = 'Loading encounter...',
    errorMessage,
}) => {
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    {loadingMessage}
                </Typography>
            </Box>
        );
    }

    if (isError || hasNoData) {
        const displayMessage = errorMessage
            ?? (error && typeof error === 'object' && 'message' in error
                ? String(error.message)
                : 'An unexpected error occurred');

        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                    p: 3,
                }}
            >
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                    Failed to load encounter
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {displayMessage}
                </Typography>
                {onGoBack && (
                    <Button variant="contained" onClick={onGoBack}>
                        Go Back
                    </Button>
                )}
            </Box>
        );
    }

    return null;
};

/**
 * Hook to check if we should show loading/error state.
 * Returns the component to render if in loading/error state, or null if ready to render main content.
 *
 * @example
 * const loadingState = useEncounterLoadingState({
 *     isLoading,
 *     isError,
 *     error,
 *     hasNoData: !encounter,
 *     onGoBack: () => navigate(-1),
 * });
 *
 * if (loadingState) return loadingState;
 *
 * // Render main content
 */
export const useEncounterLoadingState = (
    options: UseEncounterLoadingStateOptions
): React.ReactNode | null => {
    const { isLoading, isError, hasNoData } = options;

    if (isLoading || isError || hasNoData) {
        return <EncounterLoadingState {...options} />;
    }

    return null;
};
