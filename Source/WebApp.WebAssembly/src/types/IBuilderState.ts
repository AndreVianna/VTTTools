interface IBuilderState {
    // immutable properties
    readonly id: string;
    readonly containerRect: IRectangle;
    readonly imageSize: ISize;
    readonly layers: ILayer[];

    // mutable properties
    containerScroll: IPoint;
    zoomLevel: number;
    layerRect: IRectangle;
}
