import React from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { SceneBarrier, Barrier } from '@/types/domain';

export interface BarrierContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    sceneBarrier: SceneBarrier | null;
    barrier: Barrier | null;
    onEditVertices?: (sceneBarrierId: string) => void;
    onDelete?: (sceneBarrierId: string) => void;
}

export const BarrierContextMenu: React.FC<BarrierContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    sceneBarrier,
    barrier,
    onEditVertices,
    onDelete,
}) => {
    if (!sceneBarrier || !barrier) return null;

    const handleEditVertices = () => {
        onEditVertices?.(sceneBarrier.id);
        onClose();
    };

    const handleDelete = () => {
        onDelete?.(sceneBarrier.id);
        onClose();
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition ?? undefined}
            open={open}
            onClose={onClose}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
            <MenuItem onClick={handleEditVertices}>
                <ListItemIcon>
                    <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Vertices</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
            </MenuItem>
        </Menu>
    );
};
