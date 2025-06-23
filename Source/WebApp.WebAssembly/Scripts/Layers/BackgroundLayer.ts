class BackgroundLayer extends Layer implements IBackgroundLayer {
    readonly imageUrl: string;
    constructor(imageUrl: string) {
        super("background", document.querySelector<HTMLCanvasElement>(`#background-layer`)!);
        this.imageUrl = imageUrl;
    }

    protected drawLayer(zoomLevel: number) {
        ImageCache.loadImage(this.imageUrl, img => {
            this.ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
