namespace VttTools.Data.Helpers;

public static class GridConverter {
    public static Position PositionToGrid(Position pixel, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (pixel.X - grid.Offset.Left) / grid.CellSize.Width,
                                   (pixel.Y - grid.Offset.Top) / grid.CellSize.Height
                                  ),
            GridType.NoGrid => pixel,
            GridType.HexH => pixel,
            GridType.HexV => pixel,
            GridType.Isometric => pixel,
            _ => pixel
        };

    public static Position PositionToPixel(Position gridPosition, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (gridPosition.X * grid.CellSize.Width) + grid.Offset.Left,
                                   (gridPosition.Y * grid.CellSize.Height) + grid.Offset.Top
                                  ),
            GridType.NoGrid => gridPosition,
            GridType.HexH => gridPosition,
            GridType.HexV => gridPosition,
            GridType.Isometric => gridPosition,
            _ => gridPosition
        };

    public static Point PointToGrid(Point pixel, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (pixel.X - grid.Offset.Left) / grid.CellSize.Width,
                                   (pixel.Y - grid.Offset.Top) / grid.CellSize.Height
                                  ),
            GridType.NoGrid => pixel,
            GridType.HexH => pixel,
            GridType.HexV => pixel,
            GridType.Isometric => pixel,
            _ => pixel
        };

    public static Point PointToPixel(Point gridPoint, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (gridPoint.X * grid.CellSize.Width) + grid.Offset.Left,
                                   (gridPoint.Y * grid.CellSize.Height) + grid.Offset.Top
                                  ),
            GridType.NoGrid => gridPoint,
            GridType.HexH => gridPoint,
            GridType.HexV => gridPoint,
            GridType.Isometric => gridPoint,
            _ => gridPoint
        };

    public static Pole PoleToGrid(Pole pixel, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (pixel.X - grid.Offset.Left) / grid.CellSize.Width,
                                   (pixel.Y - grid.Offset.Top) / grid.CellSize.Height,
                                   pixel.H
                                  ),
            GridType.NoGrid => pixel,
            GridType.HexH => pixel,
            GridType.HexV => pixel,
            GridType.Isometric => pixel,
            _ => pixel
        };

    public static Pole PoleToPixel(Pole gridPole, Grid grid)
        => grid.Type switch {
            GridType.Square => new(
                                   (gridPole.X * grid.CellSize.Width) + grid.Offset.Left,
                                   (gridPole.Y * grid.CellSize.Height) + grid.Offset.Top,
                                   gridPole.H
                                  ),
            GridType.NoGrid => gridPole,
            GridType.HexH => gridPole,
            GridType.HexV => gridPole,
            GridType.Isometric => gridPole,
            _ => gridPole
        };
}