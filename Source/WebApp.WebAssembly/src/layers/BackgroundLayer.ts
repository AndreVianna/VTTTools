class BackgroundLayer extends Layer implements IBackgroundLayer {
    readonly imageUrl: string;
    //imageSize: ISize = null!;

    constructor(imageUrl: string) {
        super("background", document.querySelector<HTMLCanvasElement>(`#background-layer`)!);
        this.imageUrl = imageUrl;
    }

    protected drawLayer() {
        ImageCache.loadImage(this.imageUrl, img => {
            this.ctx.drawImage(img, RenderConstants.canvasPadding, RenderConstants.canvasPadding, img.width, img.height);
        });
    }
}
