class GridRenderer {
    static render(grid: IGridDetails, layer: ICanvasLayer | null): void {
        if (!layer?.ctx) return;

        if (!grid || grid.type === GridType.NoGrid) {
            this.clearLayer(layer!);
            return;
        }

        this.setupGridRendering(layer!.ctx);
        this.renderGridByType(grid, layer!.ctx);
    }

    private static clearLayer(layer: ICanvasLayer): void {
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    private static setupGridRendering(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = RenderConstants.gridStrokeStyle;
        ctx.lineWidth = 1;
    }

    private static renderGridByType(grid: IGridDetails, ctx: CanvasRenderingContext2D): void {
        const offsetX = grid.offset?.x || 0;
        const offsetY = grid.offset?.y || 0;
        const cellWidth = grid.cellSize?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = grid.cellSize?.height || RenderConstants.defaultGridCellSize;

        switch (grid.type) {
            case GridType.Square:
                this.renderSquareGrid(ctx, offsetX, offsetY, cellWidth, cellHeight);
                break;
            case GridType.HexV:
            case GridType.HexH:
            case GridType.Isometric:
                this.renderUnsupportedGridMessage(ctx, "Grid type not yet implemented");
                break;
        }
    }

    private static renderSquareGrid(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, cellWidth: number, cellHeight: number): void {
        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        this.drawVerticalLines(ctx, offsetX, cellWidth, canvasWidth, canvasHeight);
        this.drawHorizontalLines(ctx, offsetY, cellHeight, canvasWidth, canvasHeight);
    }

    private static drawVerticalLines(ctx: CanvasRenderingContext2D, offsetX: number, cellWidth: number, canvasWidth: number, canvasHeight: number): void {
        for (let x = offsetX; x < canvasWidth; x += cellWidth) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
    }

    private static drawHorizontalLines(ctx: CanvasRenderingContext2D, offsetY: number, cellHeight: number, canvasWidth: number, canvasHeight: number): void {
        for (let y = offsetY; y < canvasHeight; y += cellHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
    }

    private static renderUnsupportedGridMessage(ctx: CanvasRenderingContext2D, message: string): void {
        ctx.font = RenderConstants.gridMessageFont;
        ctx.fillStyle = RenderConstants.gridMessageColor;
        ctx.fillText(message, 20, 60);
    }
}