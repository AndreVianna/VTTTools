interface IRenderData {
    id: string;
    imageUrl: string;
    canvasSize: ISize;
    zoomLevel: number;
    panOffset: IPoint;
    grid: IGridDetails;
    assets: IAsset[];
}
