class SceneBuilder {
    private static sceneWindow: ISceneWindow;

    static initialize(): void {
        this.sceneWindow = window as unknown as ISceneWindow;
        this.initializeWindowState();
        this.bindWindowMethods();
    }

    private static initializeWindowState(): void {
        this.sceneWindow.sceneLayers = {
            background: null,
            grid: null,
            assets: null
        };

        this.sceneWindow.renderState = {
            lastBackgroundUrl: null
        };
    }

    private static bindWindowMethods(): void {
        this.sceneWindow.initStage = this.initStage.bind(this);
        this.sceneWindow.drawStage = this.drawStage.bind(this);
        this.sceneWindow.getImageDimensionsFromUrl = ImageCache.getImageDimensions.bind(ImageCache);
        this.sceneWindow.getCanvasBoundingRect = DomUtils.getCanvasBoundingRect.bind(DomUtils);
        this.sceneWindow.getScrollPosition = DomUtils.getScrollPosition.bind(DomUtils);
        this.sceneWindow.setScrollPosition = DomUtils.setScrollPosition.bind(DomUtils);
        this.sceneWindow.setCursor = DomUtils.setCursor.bind(DomUtils);
    }

    private static initStage(canvasContainer: HTMLElement, renderData: IRenderData): void {
        CanvasManager.initializeCanvas(canvasContainer, renderData.canvasSize, this.sceneWindow.sceneLayers);
        this.drawStage(renderData);
    }

    private static drawStage(renderData: IRenderData): void {
        BackgroundRenderer.render(renderData.imageUrl, this.sceneWindow.sceneLayers.background, this.sceneWindow.renderState);
        GridRenderer.render(renderData.grid, this.sceneWindow.sceneLayers.grid);
        AssetRenderer.render(renderData.assets, this.sceneWindow.sceneLayers.assets);
    }
}
