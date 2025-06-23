interface IBuilderHandler extends Window {
    // Properties
    state: IBuilderState;

    // HTMLElements
    container: HTMLElement;
    layers: ILayer[];
    zoomDisplay: HTMLElement;

    // Actions
    setup(id: string, setup: ILayersSetup): void;
    setLayer(layer: ILayer): void;
    setZoom(zoomAction: string): void;
    render(): void;

    // Image utilities
    getImageSize(url: string): Promise<ISize>;

    // DOM Elements manipulation
    getContainerRect(container: HTMLElement): IRectangle;
    getContainerScroll(container: HTMLElement): IPoint;
    setContainerScroll(container: HTMLElement, position: IPoint): void;
    getCanvasRect(canvas: HTMLCanvasElement): IRectangle;
    setCanvasRect(canvas: HTMLCanvasElement, rect: IRectangle): void;
    setCursor(container: HTMLElement, cursor: string): void;
    setZoomDisplay(zoomDisplay: HTMLElement, zoomLevel: number): void;
}
