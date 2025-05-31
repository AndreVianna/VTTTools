class SceneBuilder {
    private static builder: IBuilder;

    static initialize(): void {
        this.builder = window as unknown as IBuilder;
        this.initializeProperties();
        this.bindMethods();
    }

    private static initializeProperties(): void {
        this.builder.layers = {
            background: null,
            grid: null,
            assets: null
        };

        this.builder.state = {
            id: undefined,
            imageUrl: undefined,
            imageSize: { width: 0, height: 0 }, // 4K resolution
            canvasSize: { width: 3840, height: 2160 }, // 4K resolution
            zoomLevel: 1.0,
            zoomCenter: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            grid: {
                type: GridType.NoGrid,
                cell: { width: 50, height: 50 },
                offset: { x: 0, y: 0 },
                snap: false,
            },
            assets: []
        };
    }

    private static bindMethods(): void {
        this.builder.resetZoom = this.resetZoom.bind(this);
        this.builder.initStage = this.initStage.bind(this);
        this.builder.drawStage = this.drawStage.bind(this);
        this.builder.getImageDimensionsFromUrl = ImageCache.getImageDimensions.bind(ImageCache);
        this.builder.getCanvasBoundingRect = DomUtils.getCanvasBoundingRect.bind(DomUtils);
        this.builder.getScrollPosition = DomUtils.getScrollPosition.bind(DomUtils);
        this.builder.setScrollPosition = DomUtils.setScrollPosition.bind(DomUtils);
        this.builder.setCursor = DomUtils.setCursor.bind(DomUtils);
        this.builder.setupCanvasWheelPrevention = this.setupCanvasWheelHandler.bind(this);
    }

    private static initStage(canvasContainer: HTMLElement, initialState: IBuilderState): void {
        this.builder.state = initialState;
        CanvasManager.initializeCanvas(canvasContainer, this.builder);
        this.setupCanvasWheelHandler(canvasContainer);
        this.drawStage(initialState);
    }

    private static setupCanvasWheelHandler(canvasContainer: HTMLElement): void {
        canvasContainer.addEventListener('wheel', (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleZoom(e.deltaY, e.clientX, e.clientY, canvasContainer);
        }, { passive: false });
    }

    private static handleZoom(deltaY: number, clientX: number, clientY: number, canvasContainer: HTMLElement): void {
        const MIN_ZOOM = 0.1;
        const MAX_ZOOM = 4.0;
        const ZOOM_STEP = 0.1;

        let currentZoom = this.builder.state.zoomLevel ?? 1.0;
        const zoomDirection = deltaY > 0 ? -1 : 1;
        let newZoomLevel = currentZoom + (zoomDirection * ZOOM_STEP);
        newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel));
        if (Math.abs(newZoomLevel - currentZoom) < (ZOOM_STEP / 2)) return;

        const rect = canvasContainer.getBoundingClientRect();
        const mouseX = clientX - rect.left + canvasContainer.scrollLeft;
        const mouseY = clientY - rect.top + canvasContainer.scrollTop;
        const currentZoomCenter = this.builder.state.zoomCenter;
        console.log(`mouse: ${mouseX}, ${mouseY}`);
        console.log(`currentZoomCenter: ${currentZoomCenter.x}, ${currentZoomCenter.y}`);
        console.log(`currentZoom: ${currentZoom}`);
        const newZoomCenter = {
            x: mouseX,
            y: mouseY
        };
        console.log(`newZoomCenter: ${newZoomCenter.x}, ${newZoomCenter.y}`);

        const newState: IBuilderState = {
            ...this.builder.state,
            zoomLevel: newZoomLevel,
            zoomCenter: newZoomCenter
        };
        this.redrawAllLayers(newState);
        this.updateZoomIndicator(newZoomLevel);
        this.builder.state.zoomLevel = newZoomLevel;
        this.builder.state.zoomCenter = newZoomCenter;
    }

    private static redrawAllLayers(newState: IBuilderState): void {
        this.clearAllLayers();
        BackgroundRenderer.render(
            this.builder.layers.background,
            this.builder.state,
            newState);

        GridRenderer.render(
            this.builder.layers.grid,
            this.builder.state,
            newState);

        AssetRenderer.render(
            this.builder.layers.assets,
            this.builder.state,
            newState);
    }

    private static clearAllLayers(): void {
        for (const layerKey in this.builder.layers) {
            const layer = this.builder.layers[layerKey as keyof ISceneLayers];
            if (!layer) continue;
            const ctx = layer.ctx;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        }
    }


    private static updateZoomIndicator(zoomLevel: number): void {
        const zoomIndicator = document.querySelector('.zoom-indicator');
        if (zoomIndicator) zoomIndicator.textContent = `${Math.round(zoomLevel * 100)}%`;
    }

    static resetZoom(): void {
        const newState: IBuilderState = {
            ...this.builder.state,
            zoomLevel: 1.0,
            zoomCenter: { x: 0, y: 0 }
        };
        this.redrawAllLayers(newState);
        this.updateZoomIndicator(1.0);
        this.builder.state.zoomLevel = newState.zoomLevel;
        this.builder.state.zoomCenter = newState.zoomCenter;
    }

    private static drawStage(newState: IBuilderState): void {
        BackgroundRenderer.render(this.builder.layers.background, this.builder.state, newState);
        GridRenderer.render(this.builder.layers.grid, this.builder.state, newState);
        AssetRenderer.render(this.builder.layers.assets, this.builder.state, newState);
        this.builder.state.zoomLevel = newState.zoomLevel;
        this.builder.state.zoomCenter = newState.zoomCenter;
    }
}
