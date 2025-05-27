namespace VttTools.WebApp.WebAssembly.Extensions;

public static class PointExtensions {
    internal static Point RelativeTo(this Point position, Point distance)
        => new (position.X - distance.X, position.Y - distance.Y);
    internal static Point ShiftedBy(this Point position, Point distance)
        => new(position.X + distance.X, position.Y + distance.Y);

    internal static bool IsWithin(this Point position, Point start, Point end)
        => position.X >= start.X && position.X <= end.X &&
           position.Y >= start.Y && position.Y <= end.Y;
}
