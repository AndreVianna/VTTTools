class RenderConstants {
    static readonly canvasPadding: number = 200;

    static readonly selectionBorderWidth: number = 2;
    static readonly selectionBorderPadding: number = 3;
    static readonly selectionStrokeStyle: string = "rgba(0, 126, 255, 0.8)";

    static readonly minZoomLevel: number = 0.1;
    static readonly maxZoomLevel: number = 4.0;
    static readonly zoomStep: number = 0.1 + Number.EPSILON;

    static readonly defaultAssetColor: string = "rgba(100, 100, 100, 0.7)";
    static readonly defaultAssetSize: number = 40;
    static readonly assetNameFont: string = "12px Arial";
    static readonly assetNameColor: string = "black";

    static readonly defaultGridCellSize: number = 50;
    static readonly gridMessageFont: string = "20px Arial";
    static readonly gridMessageColor: string = "rgba(0, 0, 0, 0.5)";
    static readonly gridStrokeStyle: string = "rgba(0, 0, 0, 0.3)";

    static readonly lockIconFont: string = "16px Arial";
    static readonly lockIconColor: string = "rgba(255, 0, 0, 0.7)";
    static readonly lockIconOffset: number = 8;
}
