class BackgroundRenderer {
    static render(imageUrl: string, layer: ICanvasLayer | null, renderState: IRenderState): void {
        if (!imageUrl || !layer?.ctx) return;

        if (!this.hasBackgroundChanged(imageUrl, renderState)) return;

        this.updateRenderState(imageUrl, renderState);
        this.clearLayer(layer!);
        this.drawBackgroundImage(imageUrl, layer!.ctx);
    }

    private static hasBackgroundChanged(imageUrl: string, renderState: IRenderState): boolean {
        return renderState.lastBackgroundUrl !== imageUrl;
    }

    private static updateRenderState(imageUrl: string, renderState: IRenderState): void {
        renderState.lastBackgroundUrl = imageUrl;
    }

    private static clearLayer(layer: ICanvasLayer): void {
        const ctx = layer.ctx;
        ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
    }

    private static drawBackgroundImage(imageUrl: string, ctx: CanvasRenderingContext2D): void {
        ImageCache.loadImage(imageUrl, img => {
            ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}