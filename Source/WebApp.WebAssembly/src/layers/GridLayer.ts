class GridLayer extends Layer implements IGridLayer {
    readonly grid: IGrid;

    constructor(grid: IGrid) {
        super("grid", document.querySelector<HTMLCanvasElement>(`#grid-layer`)!);
        this.grid = grid;
    }

    protected drawLayer(): void {
        const offsetX = this.grid.offset?.x || 0;
        const offsetY = this.grid.offset?.y || 0;
        const cellWidth = this.grid.cell?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = this.grid.cell?.height || RenderConstants.defaultGridCellSize;

        console.log("Drawing Grid:", this.grid);
        switch (this.grid.type) {
            case GridType.Square:
                this.renderSquareGrid(offsetX, offsetY, cellWidth, cellHeight);
                break;
            case GridType.HexV:
            case GridType.HexH:
            case GridType.Isometric:
                this.renderUnsupportedGridMessage("Grid type not supported.");
                break;
        }
    }

    private renderSquareGrid(offsetX: number, offsetY: number, cellWidth: number, cellHeight: number): void {
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        this.drawVerticalLines(offsetX, cellWidth, canvasWidth, canvasHeight);
        this.drawHorizontalLines(offsetY, cellHeight, canvasWidth, canvasHeight);
    }

    private drawVerticalLines(offsetX: number, cellWidth: number, canvasWidth: number, canvasHeight: number): void {
        for (let x = offsetX; x < canvasWidth; x += cellWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, canvasHeight);
            this.ctx.stroke();
        }
    }

    private drawHorizontalLines(offsetY: number, cellHeight: number, canvasWidth: number, canvasHeight: number): void {
        for (let y = offsetY; y < canvasHeight; y += cellHeight) {
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
