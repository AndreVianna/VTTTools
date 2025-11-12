import { SnapMode } from './structureSnapping';

/**
 * Determines snap mode from keyboard modifier keys
 *
 * @param evt - Mouse or keyboard event containing modifier key state
 * @param externalSnapMode - Optional override snap mode
 * @returns Determined snap mode
 */
export function getSnapModeFromEvent(
  evt: { altKey: boolean; ctrlKey: boolean },
  externalSnapMode?: SnapMode,
): SnapMode {
  if (externalSnapMode !== undefined) {
    return externalSnapMode;
  }

  if (evt.altKey && evt.ctrlKey) {
    return SnapMode.QuarterSnap;
  } else if (evt.altKey) {
    return SnapMode.Free;
  } else {
    return SnapMode.HalfSnap;
  }
}
