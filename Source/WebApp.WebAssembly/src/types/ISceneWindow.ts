interface ISceneWindow extends Window {
    sceneLayers: ISceneLayers;
    renderState: IRenderState;
    initStage(canvasContainer: HTMLElement, renderData: IRenderData): void;
    drawStage(renderData: IRenderData): void;
    getImageDimensionsFromUrl(url: string): Promise<IMageDimensions>;
    getCanvasBoundingRect(canvasContainer: HTMLElement): ICanvasBounds | null;
    getScrollPosition(container: HTMLElement): IScrollPosition;
    setScrollPosition(container: HTMLElement, position: IScrollPosition): void;
    setCursor(container: HTMLElement, cursor: string): void;
}