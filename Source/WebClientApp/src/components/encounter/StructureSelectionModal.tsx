import type React from 'react';
import type { EncounterRegion, EncounterSource, EncounterWall } from '@/types/domain';
import type { DrawingMode } from './StructureToolbar';

export interface StructureSelectionModalProps {
  open: boolean;
  mode: DrawingMode;
  onSelect: (structure: EncounterWall | EncounterRegion | EncounterSource) => void;
  onCancel: () => void;
}

export const StructureSelectionModal: React.FC<StructureSelectionModalProps> = ({
  open: _open,
  mode: _mode,
  onSelect: _onSelect,
  onCancel: _onCancel,
}) => {
  return null;
};

StructureSelectionModal.displayName = 'StructureSelectionModal';
