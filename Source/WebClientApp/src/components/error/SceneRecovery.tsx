import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CloudSync as SyncIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { handleSceneError, retryOperation } from '@/utils/errorHandling';
import { addNotification } from '@/store/slices/uiSlice';

/**
 * UC035 - Scene Saving/Loading Error Recovery
 * Auto-save functionality, retry mechanisms, and data integrity protection
 */

interface AutoSaveState {
  isEnabled: boolean;
  interval: number; // milliseconds
  lastSave: number;
  pendingChanges: boolean;
  isAutoSaving: boolean;
}

interface RecoverySnapshot {
  id: string;
  sceneId: string;
  sceneName: string;
  data: any;
  timestamp: number;
  type: 'auto' | 'manual' | 'recovery';
  size: number;
}

const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const MAX_RECOVERY_SNAPSHOTS = 10;
const STORAGE_KEY_PREFIX = 'vtt_scene_recovery_';

/**
 * Scene auto-save and recovery manager
 */
export const SceneRecoveryManager: React.FC<{
  sceneId: string;
  sceneName: string;
  sceneData: any;
  onSave: (data: any, isAutoSave?: boolean) => Promise<void>;
  onLoad: (data: any) => void;
  isEnabled?: boolean;
}> = ({
  sceneId,
  sceneName,
  sceneData,
  onSave,
  onLoad,
  isEnabled = true,
}) => {
  const dispatch = useDispatch();
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>(() => ({
    isEnabled,
    interval: AUTOSAVE_INTERVAL,
    lastSave: Date.now(),
    pendingChanges: false,
    isAutoSaving: false,
  }));

  const [recoverySnapshots, setRecoverySnapshots] = useState<RecoverySnapshot[]>([]);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const lastSaveDataRef = useRef<string>('');
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Update current time every 10 seconds for timestamp display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadRecoverySnapshots = useCallback(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sceneId}`);
      if (stored) {
        const snapshots: RecoverySnapshot[] = JSON.parse(stored);
        setRecoverySnapshots(snapshots.filter(s => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000)); // Keep 7 days
      }
    } catch (_error) {
      console.warn('Failed to load recovery snapshots:', _error);
    }
  }, [sceneId]);

  // Load existing recovery snapshots on mount
  useEffect(() => {
    loadRecoverySnapshots();
    // Run only once on mount - loadRecoverySnapshots is stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRecoverySnapshot = useCallback((data: any, type: RecoverySnapshot['type']) => {
    try {
      const snapshot: RecoverySnapshot = {
        id: Date.now().toString(),
        sceneId,
        sceneName,
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        timestamp: Date.now(),
        type,
        size: JSON.stringify(data).length,
      };

      const updatedSnapshots = [snapshot, ...recoverySnapshots]
        .slice(0, MAX_RECOVERY_SNAPSHOTS)
        .sort((a, b) => b.timestamp - a.timestamp);

      setRecoverySnapshots(updatedSnapshots);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${sceneId}`, JSON.stringify(updatedSnapshots));
    } catch (_error) {
      console.warn('Failed to save recovery snapshot:', _error);
    }
  }, [sceneId, sceneName, recoverySnapshots]);

  const performAutoSave = useCallback(async () => {
    if (!sceneData || autoSaveState.isAutoSaving) return;

    setAutoSaveState(prev => ({ ...prev, isAutoSaving: true }));

    try {
      await retryOperation(
        () => onSave(sceneData, true),
        {
          maxRetries: 2,
          delay: 1000,
          exponentialBackoff: true,
        }
      );

      // Save recovery snapshot on successful auto-save
      saveRecoverySnapshot(sceneData, 'auto');

      lastSaveDataRef.current = JSON.stringify(sceneData);
      setAutoSaveState(prev => ({
        ...prev,
        lastSave: Date.now(),
        pendingChanges: false,
        isAutoSaving: false,
      }));

      dispatch(addNotification({
        type: 'info',
        message: 'Scene auto-saved successfully',
        duration: 2000,
      }));

    } catch (_error) {
      // Auto-save failed, save recovery snapshot locally
      saveRecoverySnapshot(sceneData, 'recovery');

      setAutoSaveState(prev => ({ ...prev, isAutoSaving: false }));

      handleSceneError(_error, 'save', {
        sceneId,
        sceneName,
        isAutoSave: true,
      });

      dispatch(addNotification({
        type: 'warning',
        message: 'Auto-save failed, data saved locally for recovery',
        duration: 5000,
      }));
    }
  }, [sceneData, onSave, autoSaveState.isAutoSaving, saveRecoverySnapshot, dispatch, sceneId, sceneName]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveState.isEnabled || !sceneData) return;

    const currentDataString = JSON.stringify(sceneData);
    if (currentDataString === lastSaveDataRef.current) return;

    setAutoSaveState(prev => ({ ...prev, pendingChanges: true }));

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, autoSaveState.interval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // performAutoSave is stable via useCallback and includes all necessary dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneData, autoSaveState.isEnabled, autoSaveState.interval]);

  const performManualSave = useCallback(async () => {
    if (!sceneData) return;

    try {
      await retryOperation(
        () => onSave(sceneData, false),
        {
          maxRetries: 3,
          delay: 1000,
          exponentialBackoff: true,
        }
      );

      saveRecoverySnapshot(sceneData, 'manual');
      lastSaveDataRef.current = JSON.stringify(sceneData);

      setAutoSaveState(prev => ({
        ...prev,
        lastSave: Date.now(),
        pendingChanges: false,
      }));

      dispatch(addNotification({
        type: 'success',
        message: 'Scene saved successfully',
        duration: 3000,
      }));

    } catch (_error) {
      // Manual save failed, save recovery snapshot
      saveRecoverySnapshot(sceneData, 'recovery');

      handleSceneError(_error, 'save', {
        sceneId,
        sceneName,
        isManualSave: true,
      });
    }
  }, [sceneData, onSave, saveRecoverySnapshot, dispatch, sceneId, sceneName]);

  const restoreFromSnapshot = useCallback(async (snapshot: RecoverySnapshot) => {
    try {
      onLoad(snapshot.data);

      dispatch(addNotification({
        type: 'success',
        message: `Scene restored from ${snapshot.type} save`,
        duration: 3000,
      }));

      setShowRecoveryDialog(false);
    } catch (_error) {
      handleSceneError(_error, 'load', {
        sceneId,
        sceneName,
        snapshotId: snapshot.id,
      });
    }
  }, [onLoad, dispatch, sceneId, sceneName]);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    const updatedSnapshots = recoverySnapshots.filter(s => s.id !== snapshotId);
    setRecoverySnapshots(updatedSnapshots);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${sceneId}`, JSON.stringify(updatedSnapshots));
  }, [recoverySnapshots, sceneId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const diff = currentTime - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Auto-save status indicator */}
      <SceneRecoveryStatusBar
        autoSaveState={autoSaveState}
        hasRecoverySnapshots={recoverySnapshots.length > 0}
        onManualSave={performManualSave}
        onShowRecovery={() => setShowRecoveryDialog(true)}
        onToggleAutoSave={(enabled) =>
          setAutoSaveState(prev => ({ ...prev, isEnabled: enabled }))
        }
      />

      {/* Recovery dialog */}
      <Dialog
        open={showRecoveryDialog}
        onClose={() => setShowRecoveryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Scene Recovery - {sceneName}
        </DialogTitle>

        <DialogContent>
          {recoverySnapshots.length === 0 ? (
            <Alert severity="info">
              <AlertTitle>No Recovery Data Available</AlertTitle>
              No previous versions of this scene are available for recovery.
            </Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Available Recovery Points</AlertTitle>
                Select a previous version to restore. Your current changes will be lost.
              </Alert>

              <List>
                {recoverySnapshots.map((snapshot) => (
                  <ListItem key={snapshot.id} divider>
                    <ListItemIcon>
                      {snapshot.type === 'auto' && <ScheduleIcon color="primary" />}
                      {snapshot.type === 'manual' && <SaveIcon color="success" />}
                      {snapshot.type === 'recovery' && <WarningIcon color="warning" />}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1">
                            {snapshot.type === 'auto' ? 'Auto-save' :
                             snapshot.type === 'manual' ? 'Manual save' : 'Recovery save'}
                          </Typography>
                          <Chip
                            label={formatFileSize(snapshot.size)}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={formatTimestamp(snapshot.timestamp)}
                    />

                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Restore this version">
                          <IconButton
                            color="primary"
                            onClick={() => restoreFromSnapshot(snapshot)}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete this recovery point">
                          <IconButton
                            color="error"
                            onClick={() => deleteSnapshot(snapshot.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowRecoveryDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Status bar component for scene recovery
 */
interface SceneRecoveryStatusBarProps {
  autoSaveState: AutoSaveState;
  hasRecoverySnapshots: boolean;
  onManualSave: () => void;
  onShowRecovery: () => void;
  onToggleAutoSave: (enabled: boolean) => void;
}

const SceneRecoveryStatusBar: React.FC<SceneRecoveryStatusBarProps> = ({
  autoSaveState,
  hasRecoverySnapshots,
  onManualSave,
  onShowRecovery,
  onToggleAutoSave,
}) => {
  // Track current time for reactive timestamp calculations
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time every 10 seconds for status display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getAutoSaveStatus = () => {
    if (!autoSaveState.isEnabled) return 'Auto-save disabled';
    if (autoSaveState.isAutoSaving) return 'Auto-saving...';
    if (autoSaveState.pendingChanges) return 'Changes pending...';

    const timeSinceLastSave = currentTime - autoSaveState.lastSave;
    const minutesAgo = Math.floor(timeSinceLastSave / 60000);

    if (minutesAgo === 0) return 'Saved just now';
    if (minutesAgo === 1) return 'Saved 1 minute ago';
    return `Saved ${minutesAgo} minutes ago`;
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' | 'info' => {
    if (!autoSaveState.isEnabled) return 'warning';
    if (autoSaveState.isAutoSaving) return 'info';
    if (autoSaveState.pendingChanges) return 'warning';
    return 'success';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <SyncIcon
        color={getStatusColor()}
        sx={{
          animation: autoSaveState.isAutoSaving ? 'spin 1s linear infinite' : 'none',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />

      <Typography variant="body2" color="text.secondary">
        {getAutoSaveStatus()}
      </Typography>

      {autoSaveState.isAutoSaving && (
        <LinearProgress
          size={16}
          sx={{ width: 60, height: 2, borderRadius: 1 }}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
        <Tooltip title="Toggle auto-save">
          <Button
            size="small"
            variant={autoSaveState.isEnabled ? "outlined" : "contained"}
            color={autoSaveState.isEnabled ? "primary" : "warning"}
            onClick={() => onToggleAutoSave(!autoSaveState.isEnabled)}
          >
            Auto-save {autoSaveState.isEnabled ? 'ON' : 'OFF'}
          </Button>
        </Tooltip>

        <Button
          size="small"
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={onManualSave}
          disabled={autoSaveState.isAutoSaving}
        >
          Save Now
        </Button>

        {hasRecoverySnapshots && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={<RestoreIcon />}
            onClick={onShowRecovery}
          >
            Recovery
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default SceneRecoveryManager;