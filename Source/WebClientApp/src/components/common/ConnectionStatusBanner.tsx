// GENERATED: 2025-10-11 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Component)

/**
 * ConnectionStatusBanner Component
 * Displays connection status overlay when offline or syncing
 * Features:
 * - "Connection Lost" UI overlay
 * - Reconnection status display
 * - Pending changes indicator
 * - Sync progress display
 * ACCEPTANCE_CRITERION: AC-05 - Connection lost UI blocks editing
 */

import React from 'react';
import {
    Box,
    Alert,
    AlertTitle,
    Typography,
    LinearProgress,
    Button,
    Chip,
} from '@mui/material';
import {
    CloudOff as CloudOffIcon,
    CloudDone as CloudDoneIcon,
    CloudSync as CloudSyncIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { SyncStatus } from '@/services/offlineSyncManager';

/**
 * ConnectionStatusBanner component props
 */
export interface ConnectionStatusBannerProps {
    /** Current sync status */
    syncStatus: SyncStatus;
    /** Is connection online */
    isOnline: boolean;
    /** Has pending changes to sync */
    hasPendingChanges: boolean;
    /** Callback to force sync */
    onForceSync?: () => void;
    /** Show banner (default: auto based on status) */
    show?: boolean;
}

/**
 * ConnectionStatusBanner Component
 * Material-UI banner for connection and sync status
 */
export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
    syncStatus,
    isOnline: _isOnline,
    hasPendingChanges,
    onForceSync,
    show,
}) => {
    // Determine if banner should be shown
    const shouldShow =
        show !== undefined
            ? show
            : syncStatus === SyncStatus.Offline ||
              syncStatus === SyncStatus.Syncing ||
              syncStatus === SyncStatus.Error;

    if (!shouldShow) {
        return null;
    }

    /**
     * Get banner configuration based on sync status
     */
    const getBannerConfig = (): {
        severity: 'error' | 'warning' | 'info' | 'success';
        icon: React.ReactElement;
        title: string;
        message: string;
        showProgress: boolean;
        showAction: boolean;
    } => {
        switch (syncStatus) {
            case SyncStatus.Offline:
                return {
                    severity: 'warning',
                    icon: <CloudOffIcon />,
                    title: 'Connection Lost',
                    message: hasPendingChanges
                        ? 'Changes saved locally. Will sync when connection is restored.'
                        : 'You are currently offline. Changes will be saved locally.',
                    showProgress: false,
                    showAction: false,
                };

            case SyncStatus.Syncing:
                return {
                    severity: 'info',
                    icon: <CloudSyncIcon />,
                    title: 'Syncing...',
                    message: 'Saving changes to server.',
                    showProgress: true,
                    showAction: false,
                };

            case SyncStatus.Error:
                return {
                    severity: 'error',
                    icon: <ErrorIcon />,
                    title: 'Sync Failed',
                    message: 'Failed to save changes. Will retry automatically.',
                    showProgress: false,
                    showAction: true,
                };

            case SyncStatus.Online:
                return {
                    severity: 'success',
                    icon: <CloudDoneIcon />,
                    title: 'Connected',
                    message: 'All changes saved.',
                    showProgress: false,
                    showAction: false,
                };

            default:
                return {
                    severity: 'info',
                    icon: <CloudSyncIcon />,
                    title: 'Unknown Status',
                    message: 'Connection status unknown.',
                    showProgress: false,
                    showAction: false,
                };
        }
    };

    const config = getBannerConfig();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1400, // Above Material-UI AppBar (1200)
                pointerEvents: syncStatus === SyncStatus.Offline ? 'auto' : 'none', // Block clicks when offline
            }}
        >
            <Alert
                severity={config.severity}
                icon={config.icon}
                sx={{
                    borderRadius: 0,
                    '& .MuiAlert-message': {
                        width: '100%',
                    },
                }}
                action={
                    config.showAction && onForceSync ? (
                        <Button
                            color="inherit"
                            size="small"
                            onClick={onForceSync}
                            sx={{ pointerEvents: 'auto' }}
                        >
                            Retry Now
                        </Button>
                    ) : undefined
                }
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <AlertTitle sx={{ mb: 0.5 }}>{config.title}</AlertTitle>
                        <Typography variant="body2">{config.message}</Typography>
                    </Box>

                    {/* Pending changes indicator */}
                    {hasPendingChanges && syncStatus !== SyncStatus.Syncing && (
                        <Chip
                            label="Unsaved Changes"
                            size="small"
                            color={syncStatus === SyncStatus.Offline ? 'warning' : 'error'}
                            sx={{ pointerEvents: 'none' }}
                        />
                    )}
                </Box>

                {/* Progress bar for syncing */}
                {config.showProgress && (
                    <LinearProgress
                        sx={{ mt: 1 }}
                        color={config.severity === 'info' ? 'primary' : 'inherit'}
                    />
                )}
            </Alert>

            {/* Overlay to block editing when offline */}
            {syncStatus === SyncStatus.Offline && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        backdropFilter: 'blur(1px)',
                        zIndex: 1300, // Below banner, above content
                        pointerEvents: 'auto',
                        cursor: 'not-allowed',
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                />
            )}
        </Box>
    );
};

ConnectionStatusBanner.displayName = 'ConnectionStatusBanner';
