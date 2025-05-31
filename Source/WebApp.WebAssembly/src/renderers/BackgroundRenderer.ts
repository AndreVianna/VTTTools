class BackgroundRenderer {
    static render(layer: ICanvasLayer | null, currentState: IBuilderState, newState: IBuilderState): void {
        const ctx = layer?.ctx;
        if (!ctx) return;
        this.clearLayer(layer!);
        if (!newState.imageUrl) return;
        this.applyZoomTransform(ctx, currentState, newState);
        this.drawImage(ctx, newState.imageUrl);
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

    private static drawImage(ctx: CanvasRenderingContext2D, imageUrl: string): void {
        ImageCache.loadImage(imageUrl, img => {
            ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
