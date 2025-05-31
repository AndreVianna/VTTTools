class CanvasManager {
    private static builder: IBuilder;
    private static container: HTMLElement;

    static initializeCanvas(container: HTMLElement, builder: IBuilder): void {
        this.builder = builder;
        this.container = container;
        this.setupExistingCanvasLayers();
        this.centerCanvas();
    }

    private static setupExistingCanvasLayers(): void {
        const layers: (keyof ISceneLayers)[] = ["background", "grid", "assets"];
        
        layers.forEach(layer => {
            const canvas = this.container.querySelector(`#scene-canvas-${layer}`) as HTMLCanvasElement;
            if (!canvas) {
                console.error(`Canvas element #scene-canvas-${layer} not found`);
                return;
            }
            
            this.setupSingleCanvas(canvas);
            const ctx = canvas.getContext("2d");
            if (ctx) this.builder.layers[layer] = { canvas, ctx };
        });
    }

    private static setupSingleCanvas(canvas: HTMLCanvasElement): void {
        canvas.width = this.builder.state.canvasSize.width;
        canvas.height = this.builder.state.canvasSize.height;
    }

    private static centerCanvas(): void {
        if (!this.container) return;
        this.container.scrollLeft = Math.max(0, (this.builder.state.canvasSize.width - this.container.clientWidth) / 2);
        this.container.scrollTop = Math.max(0, (this.builder.state.canvasSize.height - this.container.clientHeight) / 2);
    }
}
