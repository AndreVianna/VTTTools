class Layer implements ILayer {
    readonly id: string;
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    constructor(id: string, canvas: HTMLCanvasElement) {
        this.id = id;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        console.log("canvas:", this.canvas.width, ", ", this.canvas.height);
        this.clear();
    }

    render(zoomLevel: number): void {
        this.clear();
        this.ctx.scale(zoomLevel, zoomLevel);
        this.ctx.translate(0, 0);
        this.drawLayer(zoomLevel);
    }

    protected drawLayer(zoomLevel: number): void {
    }

    protected clear(): void {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
