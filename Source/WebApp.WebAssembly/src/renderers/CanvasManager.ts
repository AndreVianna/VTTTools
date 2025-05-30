class CanvasManager {
    static initializeCanvas(container: HTMLElement, canvasSize: ISize, sceneLayers: ISceneLayers): void {
        this.clearContainer(container);
        this.createCanvasLayers(container, canvasSize, sceneLayers);
        this.centerCanvas(container, canvasSize);
    }

    private static clearContainer(container: HTMLElement): void {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    private static createCanvasLayers(container: HTMLElement, canvasSize: ISize, sceneLayers: ISceneLayers): void {
        const layers: (keyof ISceneLayers)[] = ["background", "grid", "assets"];
        
        layers.forEach(layer => {
            const canvas = this.createSingleCanvas(layer, canvasSize);
            container.appendChild(canvas);
            
            const ctx = canvas.getContext("2d");
            if (ctx) {
                sceneLayers[layer] = { canvas, ctx };
            }
        });
    }

    private static createSingleCanvas(layer: string, canvasSize: ISize): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        canvas.id = `scene-canvas-${layer}`;
        canvas.className = "scene-canvas-layer";
        return canvas;
    }

    private static centerCanvas(container: HTMLElement, canvasSize: ISize): void {
        if (!container) return;
        
        container.scrollLeft = Math.max(0, (canvasSize.width - container.clientWidth) / 2);
        container.scrollTop = Math.max(0, (canvasSize.height - container.clientHeight) / 2);
    }
}