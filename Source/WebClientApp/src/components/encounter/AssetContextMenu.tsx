import React, { useState } from 'react';
import {
    Menu,
    MenuItem,
    TextField,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DisplayName, LabelPosition, PlacedAsset } from '../../types/domain';

interface AssetContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    asset: PlacedAsset | null;
    onRename: (assetId: string, newName: string) => Promise<void>;
    onUpdateDisplay: (assetId: string, displayName?: DisplayName, labelPosition?: LabelPosition) => Promise<void>;
}

export const AssetContextMenu: React.FC<AssetContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    asset,
    onRename,
    onUpdateDisplay,
}) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [renameError, setRenameError] = useState('');
    const [displayNameAnchorEl, setDisplayNameAnchorEl] = useState<null | HTMLElement>(null);
    const [labelPosAnchorEl, setLabelPosAnchorEl] = useState<null | HTMLElement>(null);

    const handleRenameClick = () => {
        if (!asset) return;
        setRenameValue(asset.name);
        setIsRenaming(true);
        setRenameError('');
    };

    const handleRenameSave = async () => {
        if (!asset) return;

        if (!renameValue.trim()) {
            setRenameError('Name cannot be empty');
            return;
        }
        if (renameValue.length > 128) {
            setRenameError('Name too long (max 128 characters)');
            return;
        }

        try {
            await onRename(asset.id, renameValue);
            setIsRenaming(false);
            onClose();
        } catch (_error) {
            setRenameError('Failed to rename asset');
        }
    };

    const handleDisplayNameClick = async (displayName: DisplayName) => {
        if (!asset) return;
        await onUpdateDisplay(asset.id, displayName, undefined);
        setDisplayNameAnchorEl(null);
        onClose();
    };

    const handleLabelPosClick = async (labelPosition: LabelPosition) => {
        if (!asset) return;
        await onUpdateDisplay(asset.id, undefined, labelPosition);
        setLabelPosAnchorEl(null);
        onClose();
    };

    if (!asset) return null;

    return (
        <>
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition ?? { left: 0, top: 0 }}
                open={open}
                onClose={onClose}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                {isRenaming ? (
                    <MenuItem>
                        <TextField
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleRenameSave}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleRenameSave();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setIsRenaming(false);
                                }
                            }}
                            error={!!renameError}
                            helperText={renameError}
                            placeholder="Asset name"
                            size="small"
                            fullWidth
                            inputProps={{ maxLength: 128 }}
                        />
                    </MenuItem>
                ) : (
                    <MenuItem onClick={handleRenameClick}>
                        <ListItemText>Rename</ListItemText>
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={(e) => setDisplayNameAnchorEl(e.currentTarget)}>
                    <ListItemText>Display Label</ListItemText>
                    <ChevronRightIcon />
                </MenuItem>

                <MenuItem onClick={(e) => setLabelPosAnchorEl(e.currentTarget)}>
                    <ListItemText>Label Position</ListItemText>
                    <ChevronRightIcon />
                </MenuItem>
            </Menu>

            {displayNameAnchorEl && (
                <Menu
                    anchorEl={displayNameAnchorEl}
                    open={Boolean(displayNameAnchorEl)}
                    onClose={() => {
                        setDisplayNameAnchorEl(null);
                        onClose();
                    }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    {Object.values(DisplayName).map((value) => (
                        <MenuItem key={value} onClick={() => handleDisplayNameClick(value)}>
                            <ListItemIcon>
                                {asset.displayName === value && <CheckIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText>{value}</ListItemText>
                        </MenuItem>
                    ))}
                </Menu>
            )}

            {labelPosAnchorEl && (
                <Menu
                    anchorEl={labelPosAnchorEl}
                    open={Boolean(labelPosAnchorEl)}
                    onClose={() => {
                        setLabelPosAnchorEl(null);
                        onClose();
                    }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    {Object.values(LabelPosition).map((value) => (
                        <MenuItem key={value} onClick={() => handleLabelPosClick(value)}>
                            <ListItemIcon>
                                {asset.labelPosition === value && <CheckIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText>{value}</ListItemText>
                        </MenuItem>
                    ))}
                </Menu>
            )}
        </>
    );
};
