import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import type React from 'react';
import type { EncounterWall } from '@/types/domain';

export interface WallContextMenuProps {
  anchorPosition: { left: number; top: number } | null;
  open: boolean;
  onClose: () => void;
  encounterWall: EncounterWall | null;
  onEditVertices?: (wallIndex: number) => void;
  onDelete?: (wallIndex: number) => void;
}

export const WallContextMenu: React.FC<WallContextMenuProps> = ({
  anchorPosition,
  open,
  onClose,
  encounterWall,
  onEditVertices,
  onDelete,
}) => {
  if (!encounterWall) return null;

  const handleEditVertices = () => {
    onEditVertices?.(encounterWall.index);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(encounterWall.index);
    onClose();
  };

  return (
    <Menu
      anchorReference='anchorPosition'
      {...(anchorPosition && { anchorPosition })}
      open={open}
      onClose={onClose}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <MenuItem onClick={handleEditVertices}>
        <ListItemIcon>
          <EditIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Edit Vertices</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon fontSize='small' color='error' />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
};
