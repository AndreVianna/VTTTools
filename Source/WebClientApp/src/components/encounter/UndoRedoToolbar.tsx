// GENERATED: 2025-10-11 by Claude Code Phase 6
// WORLD: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Component)

/**
 * UndoRedoToolbar Component
 * Provides UI controls for undo/redo functionality in encounter editor
 * Features:
 * - Undo button with description tooltip
 * - Redo button with description tooltip
 * - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
 * - Disabled state when no history available
 */

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useUndoRedoContext } from '@/contexts/UndoRedoContext';

export const UndoRedoToolbar: React.FC = () => {
    const theme = useTheme();
    const { canUndo, canRedo, undo, redo } = useUndoRedoContext();

    return (
        <Box
            id="undo-redo-toolbar"
            sx={{
                display: 'flex',
                gap: 1,
                p: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                boxShadow: theme.shadows[2]
            }}
        >
            <Tooltip title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}>
                <span>
                    <IconButton
                        id="btn-undo"
                        onClick={undo}
                        disabled={!canUndo}
                        size="small"
                        sx={{
                            color: theme.palette.primary.main,
                            '&:disabled': {
                                color: theme.palette.action.disabled
                            }
                        }}
                    >
                        <UndoIcon />
                    </IconButton>
                </span>
            </Tooltip>

            <Tooltip title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}>
                <span>
                    <IconButton
                        id="btn-redo"
                        onClick={redo}
                        disabled={!canRedo}
                        size="small"
                        sx={{
                            color: theme.palette.primary.main,
                            '&:disabled': {
                                color: theme.palette.action.disabled
                            }
                        }}
                    >
                        <RedoIcon />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
};

UndoRedoToolbar.displayName = 'UndoRedoToolbar';
