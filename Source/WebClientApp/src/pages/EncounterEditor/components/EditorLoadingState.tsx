import React from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { EditorLayout } from '@components/layout';

export interface EditorLoadingStateProps {
    isLoading: boolean;
    hasError: boolean;
    hasNoData: boolean;
}

export const EditorLoadingState: React.FC<EditorLoadingStateProps> = ({
    isLoading,
    hasError,
    hasNoData,
}) => {
    if (isLoading) {
        return (
            <EditorLayout>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={60} thickness={4} />
                        <Typography variant='h6'>Loading Encounter...</Typography>
                    </Box>
                </Box>
            </EditorLayout>
        );
    }

    if (hasError || hasNoData) {
        return (
            <EditorLayout>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        p: 3,
                    }}
                >
                    <Alert severity='error'>
                        Failed to load encounter. The encounter may not exist or there was a network error.
                    </Alert>
                </Box>
            </EditorLayout>
        );
    }

    return null;
};

/**
 * Hook to check if we should show loading/error state
 * Returns the component to render if in loading/error state, or null if ready to render main content
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useEditorLoadingState = (props: EditorLoadingStateProps): React.ReactNode | null => {
    const { isLoading, hasError, hasNoData } = props;

    if (isLoading || hasError || hasNoData) {
        return <EditorLoadingState {...props} />;
    }

    return null;
};
