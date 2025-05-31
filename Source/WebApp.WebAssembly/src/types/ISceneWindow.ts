interface IBuilder extends Window {
    state: IBuilderState;
    layers: ISceneLayers;
    initStage(canvasContainer: HTMLElement, initialState: IBuilderState): void;
    drawStage(state: IBuilderState): void;
    resetZoom(centerOnly: boolean): void;
    getImageDimensionsFromUrl(url: string): Promise<IMageDimensions>;
    getCanvasBoundingRect(canvasContainer: HTMLElement): ICanvasBounds | null;
    getScrollPosition(container: HTMLElement): IScrollPosition;
    setScrollPosition(container: HTMLElement, position: IScrollPosition): void;
    setCursor(container: HTMLElement, cursor: string): void;
    setupCanvasWheelPrevention(canvasContainer: HTMLElement): void;
}
