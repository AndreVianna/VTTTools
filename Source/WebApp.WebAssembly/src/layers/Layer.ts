class Layer implements ILayer {
    readonly id: string;
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    constructor(id: string, canvas: HTMLCanvasElement) {
        this.id = id;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
    }

    render(zoomLevel: number): void {
        this.clear();
        this.ctx.scale(zoomLevel, zoomLevel);
        this.drawLayer();
    }

    protected drawLayer(): void {
    }

    private clear(): void {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
