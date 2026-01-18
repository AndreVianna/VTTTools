import { useEffect } from 'react';
import type Konva from 'konva';
import { AssetKind } from '@/types/domain';
import type { InteractionScope } from '@utils/scopeFiltering';

export interface UseStageDoubleClickProps {
    /** Konva stage reference */
    stage: Konva.Stage | null;
    /** Current active scope */
    activeScope: InteractionScope;
    /** Callback to open asset picker */
    setAssetPickerOpen: (value: { open: boolean; kind?: AssetKind }) => void;
    /** Callback to open sound picker */
    setSoundPickerOpen: (value: boolean) => void;
}

/**
 * Hook to handle stage double-click events.
 * Opens appropriate picker dialogs based on the active scope.
 */
export function useStageDoubleClick({
    stage,
    activeScope,
    setAssetPickerOpen,
    setSoundPickerOpen,
}: UseStageDoubleClickProps): void {
    useEffect(() => {
        if (!stage) return;

        const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
            if (e.target !== stage) {
                return;
            }
            if (!activeScope) {
                return;
            }

            switch (activeScope) {
                case 'objects':
                    setAssetPickerOpen({ open: true, kind: AssetKind.Object });
                    break;
                case 'monsters':
                    setAssetPickerOpen({ open: true, kind: AssetKind.Creature });
                    break;
                case 'characters':
                    setAssetPickerOpen({ open: true, kind: AssetKind.Character });
                    break;
                case 'walls':
                    break;
                case 'regions':
                    break;
                case 'lights':
                    break;
                case 'sounds':
                    setSoundPickerOpen(true);
                    break;
                default:
                    break;
            }
        };

        stage.on('dblclick', handleDblClick);
        return () => {
            stage.off('dblclick', handleDblClick);
        };
    }, [activeScope, stage, setAssetPickerOpen, setSoundPickerOpen]);
}
