namespace VttTools.WebApp.Utilities;

/// <summary>
/// Provides calculation utilities for scene builder operations
/// </summary>
internal static class SceneCalculations {
    /// <summary>
    /// Calculates mouse position relative to the scene coordinate system
    /// </summary>
    /// <param name="clientPosition">Mouse position relative to viewport</param>
    /// <param name="canvasRect">Canvas bounding rectangle</param>
    /// <param name="panOffset">Current pan offset</param>
    /// <param name="zoomLevel">Current zoom level</param>
    /// <returns>Position in scene coordinates</returns>
    internal static Point GetSceneMousePosition(Point clientPosition, Rectangle canvasRect, Point panOffset, float zoomLevel) {
        var canvasX = clientPosition.X - canvasRect.X;
        var canvasY = clientPosition.Y - canvasRect.Y;

        return new(
            (int)((canvasX - panOffset.X) / zoomLevel),
            (int)((canvasY - panOffset.Y) / zoomLevel)
        );
    }

    /// <summary>
    /// Calculates mouse position relative to the scene coordinate system accounting for zoom center
    /// </summary>
    /// <param name="clientPosition">Mouse position relative to viewport</param>
    /// <param name="canvasRect">Canvas bounding rectangle</param>
    /// <param name="panOffset">Current pan offset</param>
    /// <param name="zoomLevel">Current zoom level</param>
    /// <param name="zoomCenter">Center point of zoom transformation</param>
    /// <returns>Position in scene coordinates</returns>
    internal static Point GetSceneMousePositionWithZoom(Point clientPosition, Rectangle canvasRect, Point panOffset, float zoomLevel, Point zoomCenter) {
        var canvasX = clientPosition.X - canvasRect.X;
        var canvasY = clientPosition.Y - canvasRect.Y;

        // Apply inverse zoom transformation
        // Translate relative to zoom center, inverse scale, then translate back
        var transformedX = ((canvasX - zoomCenter.X) / zoomLevel) + zoomCenter.X;
        var transformedY = ((canvasY - zoomCenter.Y) / zoomLevel) + zoomCenter.Y;

        return new(
            (int)(transformedX - panOffset.X),
            (int)(transformedY - panOffset.Y)
        );
    }

    /// <summary>
    /// Calculates the center position for canvas scrolling
    /// </summary>
    /// <param name="canvasSize">Size of the canvas</param>
    /// <param name="containerSize">Size of the container</param>
    /// <returns>Scroll position to center the canvas</returns>
    internal static Point CalculateCenterScrollPosition(Size canvasSize, Size containerSize) => new(
            Math.Max(0, (canvasSize.Width - containerSize.Width) / 2),
            Math.Max(0, (canvasSize.Height - containerSize.Height) / 2)
        );

    /// <summary>
    /// Calculates canvas size including padding
    /// </summary>
    /// <param name="stageSize">Size of the stage/scene</param>
    /// <param name="padding">Padding around the stage</param>
    /// <returns>Total canvas size</returns>
    internal static Size CalculateCanvasSize(Size stageSize, int padding) => new(
            stageSize.Width + (2 * padding),
            stageSize.Height + (2 * padding)
        );

    /// <summary>
    /// Finds an asset at the specified position
    /// </summary>
    /// <param name="position">Position to check</param>
    /// <param name="assets">Collection of assets to search</param>
    /// <param name="padding">Canvas padding offset</param>
    /// <returns>Asset at position or null if none found</returns>
    internal static SceneAssetDetails? FindAssetAt(Point position, IEnumerable<SceneAssetDetails> assets, Point padding) {
        var relativePosition = position.RelativeTo(padding);
        return assets.FirstOrDefault(asset => {
            var assetSize = new Point(asset.Size.Width, asset.Size.Height);
            return relativePosition.IsWithin(asset.Position, asset.Position.ShiftedBy(assetSize));
        });
    }

    /// <summary>
    /// Calculates if movement exceeds the minimum threshold for panning
    /// </summary>
    /// <param name="startPosition">Initial position</param>
    /// <param name="currentPosition">Current position</param>
    /// <param name="threshold">Movement threshold</param>
    /// <returns>True if movement exceeds threshold</returns>
    internal static bool ExceedsMovementThreshold(Point startPosition, Point currentPosition, int threshold = 5) {
        var dx = Math.Abs(currentPosition.X - startPosition.X);
        var dy = Math.Abs(currentPosition.Y - startPosition.Y);
        return dx > threshold || dy > threshold;
    }

    /// <summary>
    /// Determines if grid snapping should be applied and returns snapped position
    /// </summary>
    /// <param name="position">Original position</param>
    /// <param name="grid">Grid configuration</param>
    /// <returns>Snapped position if grid snapping is enabled, otherwise original position</returns>
    internal static Point ApplyGridSnapping(Point position, GridDetails grid)
        => grid.Type == GridType.Square && grid.Snap
            ? GridCalculations.SnapToGrid(position, grid)
            : position;
}