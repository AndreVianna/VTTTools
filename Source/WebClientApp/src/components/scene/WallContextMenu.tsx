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
import type { SceneWall } from '@/types/domain';

export interface WallContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    sceneWall: SceneWall | null;
    onEditVertices?: (wallIndex: number) => void;
    onDelete?: (wallIndex: number) => void;
}

export const WallContextMenu: React.FC<WallContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    sceneWall,
    onEditVertices,
    onDelete,
}) => {
    if (!sceneWall) return null;

    const handleEditVertices = () => {
        onEditVertices?.(sceneWall.index);
        onClose();
    };

    const handleDelete = () => {
        onDelete?.(sceneWall.index);
        onClose();
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            {...(anchorPosition && { anchorPosition })}
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
