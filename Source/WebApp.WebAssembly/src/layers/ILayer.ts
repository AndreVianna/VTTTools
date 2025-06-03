interface ILayer {
    readonly id: string;
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    render(zoomLevel: number): void;
}
