class GridLayer extends Layer implements IGridLayer {
    readonly grid: IGrid;

    constructor(grid: IGrid) {
        super("grid", document.querySelector<HTMLCanvasElement>(`#grid-layer`)!);
        this.grid = grid;
    }

    protected drawLayer(zoomLevel: number) : void {
        if (this.grid.type === GridType.NoGrid) return;
        const gridOffsetX = (this.grid.offset?.x || 0);
        const gridOffsetY = (this.grid.offset?.y || 0);
        this.ctx.translate(gridOffsetX, gridOffsetY);

        const cellWidth = this.grid.cell?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = this.grid.cell?.height || RenderConstants.defaultGridCellSize;
        switch (this.grid.type) {
            case GridType.Square:
                this.renderSquareGrid(cellWidth, cellHeight);
                break;
            case GridType.HexV:
            case GridType.HexH:
            case GridType.Isometric:
                this.renderUnsupportedGridMessage("Grid type not supported.");
                break;
        }
    }

    private renderSquareGrid(cellWidth: number, cellHeight: number): void {
        this.drawVerticalLines(cellWidth, this.canvas.width, this.canvas.height);
        this.drawHorizontalLines(cellHeight, this.canvas.width, this.canvas.height);
    }

    private drawVerticalLines(cellWidth: number, canvasWidth: number, canvasHeight: number): void {
        for (let x = 0; x < canvasWidth; x += cellWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
            this.ctx.stroke();
        }
    }

    private drawHorizontalLines(cellHeight: number, canvasWidth: number, canvasHeight: number): void {
        for (let y = 0; y < canvasHeight; y += cellHeight) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(canvasWidth, y);
            this.ctx.stroke();
        }
    }

    private renderUnsupportedGridMessage(message: string): void {
        this.ctx.font = RenderConstants.gridMessageFont;
        this.ctx.fillStyle = RenderConstants.gridMessageColor;
        this.ctx.fillText(message, 20, 60);
    }
}
