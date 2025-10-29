import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    useTheme
} from '@mui/material';
import { BarrierList, RegionList, SourceList } from '@components/library';
import type { Barrier, Region, Source } from '@/types/domain';
import type { DrawingMode } from './StructureToolbar';

export interface StructureSelectionModalProps {
    open: boolean;
    mode: DrawingMode;
    onSelect: (structure: Barrier | Region | Source) => void;
    onCancel: () => void;
}

export const StructureSelectionModal: React.FC<StructureSelectionModalProps> = ({
    open,
    mode,
    onSelect,
    onCancel
}) => {
    const theme = useTheme();

    const getTitle = () => {
        switch (mode) {
            case 'barrier':
                return 'Select Barrier';
            case 'region':
                return 'Select Region';
            case 'source':
                return 'Select Light Source';
            default:
                return 'Select Structure';
        }
    };

    const handleBarrierSelect = (barrier: Barrier) => {
        onSelect(barrier);
    };

    const handleRegionSelect = (region: Region) => {
        onSelect(region);
    };

    const handleSourceSelect = (source: Source) => {
        onSelect(source);
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.default,
                    minHeight: 500,
                    maxHeight: '80vh'
                }
            }}
        >
            <DialogTitle sx={{ bgcolor: theme.palette.background.paper }}>
                {getTitle()}
            </DialogTitle>
            <DialogContent
                sx={{
                    p: 0,
                    bgcolor: theme.palette.background.default,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ height: '100%', overflow: 'auto' }}>
                    {mode === 'barrier' && <BarrierList onSelect={handleBarrierSelect} />}
                    {mode === 'region' && <RegionList onSelect={handleRegionSelect} />}
                    {mode === 'source' && <SourceList onSelect={handleSourceSelect} />}
                </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: theme.palette.background.paper }}>
                <Button onClick={onCancel} color="inherit">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

StructureSelectionModal.displayName = 'StructureSelectionModal';
