interface IBuilderState {
    id?: string;
    imageUrl?: string;
    imageSize: ISize;
    canvasSize: ISize;
    zoomLevel: number;
    zoomCenter: IPoint;
    offset: IPoint;
    grid: IGridDetails;
    assets: IAsset[];
}
