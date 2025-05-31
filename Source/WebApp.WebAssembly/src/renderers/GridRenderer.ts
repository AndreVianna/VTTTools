class GridRenderer {
    static render(layer: ICanvasLayer | null, currentState: IBuilderState, newState: IBuilderState): void {
        const ctx = layer?.ctx;
        if (!ctx) return;
        this.clearLayer(layer!);
        if (newState.grid.type === GridType.NoGrid) return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawGrid(ctx, newState.grid, newState.zoomLevel);
    }

    private static clearLayer(layer: ICanvasLayer): void {
        const ctx = layer.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to identity matrix
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    private static applyZoomTransform(ctx: CanvasRenderingContext2D, currentState: IBuilderState, newState: IBuilderState): void {
        ctx.translate(newState.zoomCenter.x, newState.zoomCenter.y);
        ctx.scale(newState.zoomLevel, newState.zoomLevel);
        ctx.translate(-newState.zoomCenter.x, -newState.zoomCenter.y);
    }

    private static drawGrid(ctx: CanvasRenderingContext2D, grid: IGridDetails, zoomLevel: number): void {
        const offsetX = grid.offset?.x || 0;
        const offsetY = grid.offset?.y || 0;
        const cellWidth = grid.cell?.width || RenderConstants.defaultGridCellSize;
        const cellHeight = grid.cell?.height || RenderConstants.defaultGridCellSize;

        switch (grid.type) {
            case GridType.Square:
                this.renderSquareGrid(ctx, offsetX, offsetY, cellWidth, cellHeight);
                break;
            case GridType.HexV:
            case GridType.HexH:
            case GridType.Isometric:
                this.renderUnsupportedGridMessage(ctx, "Grid type not yet implemented", zoomLevel);
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

    private static renderUnsupportedGridMessage(ctx: CanvasRenderingContext2D, message: string, zoomLevel: number): void {
        ctx.font = RenderConstants.gridMessageFont;
        ctx.fillStyle = RenderConstants.gridMessageColor;

        // Adjust font size for zoom level
        const fontSize = 20 / zoomLevel;
        ctx.font = `${fontSize}px Arial`;

        ctx.fillText(message, 20, 60);
    }
}
