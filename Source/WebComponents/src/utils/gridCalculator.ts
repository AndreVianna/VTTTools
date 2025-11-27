export interface GridConfig {
  type: number;
  cellSize: { width: number; height: number };
  offset: { left: number; top: number };
  snap: boolean;
}

export const snapToGrid = (position: { x: number; y: number }, _gridConfig: GridConfig): { x: number; y: number } => {
  return position;
};
