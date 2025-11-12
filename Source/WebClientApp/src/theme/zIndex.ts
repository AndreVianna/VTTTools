/**
 * Z-Index hierarchy for VTTTools Encounter Editor
 *
 * Ensures consistent layering across all UI elements
 */
export const Z_INDEX = {
  CANVAS: 1,
  DRAWING_TOOL: 10,
  TRANSFORMER: 20,
  SNAP_INDICATOR: 1000,
  STATUS_HINT: 1000,
  MODAL: 1300,
  TOOLTIP: 1500,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
