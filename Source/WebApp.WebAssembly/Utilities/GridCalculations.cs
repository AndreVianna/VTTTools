namespace VttTools.WebApp.Utilities;

internal static class GridCalculations
{
    private const int _defaultCellSize = 50;
    public static Point SnapToGrid(Point position, GridDetails grid)
    {
        if (grid.Type == GridType.NoGrid)
            return position;

        var cellWidth = grid.CellSize.X > 0 ? grid.CellSize.X : _defaultCellSize;
        var cellHeight = grid.CellSize.Y > 0 ? grid.CellSize.Y : _defaultCellSize;

        var x = (int)((Math.Round((position.X - grid.Offset.X) / cellWidth) * cellWidth) + grid.Offset.X);
        var y = (int)((Math.Round((position.Y - grid.Offset.Y) / cellHeight) * cellHeight) + grid.Offset.Y);
        return new(x, y);
    }
}