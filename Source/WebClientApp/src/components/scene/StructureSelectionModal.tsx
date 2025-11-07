import React from 'react';
import type { SceneWall, SceneRegion, SceneSource } from '@/types/domain';
import type { DrawingMode } from './StructureToolbar';

export interface StructureSelectionModalProps {
    open: boolean;
    mode: DrawingMode;
    onSelect: (structure: SceneWall | SceneRegion | SceneSource) => void;
    onCancel: () => void;
}

export const StructureSelectionModal: React.FC<StructureSelectionModalProps> = ({
    open: _open,
    mode: _mode,
    onSelect: _onSelect,
    onCancel: _onCancel
}) => {
    return null;
};

StructureSelectionModal.displayName = 'StructureSelectionModal';
