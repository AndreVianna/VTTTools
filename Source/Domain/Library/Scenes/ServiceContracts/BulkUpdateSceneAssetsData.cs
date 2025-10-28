namespace VttTools.Library.Scenes.ServiceContracts;

public record BulkUpdateSceneAssetsData {
    public required List<SceneAssetUpdateData> Updates { get; init; }

    public Result Validate() {
        if (Updates == null || Updates.Count == 0)
            return Result.Failure("Updates list cannot be empty");

        foreach (var update in Updates) {
            var result = update.Validate();
            if (result.HasErrors)
                return result;
        }

        return Result.Success();
    }
}

public record SceneAssetUpdateData {
    public required uint Index { get; init; }
    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<DisplayName> DisplayName { get; init; } = Optional<DisplayName>.None;
    public Optional<LabelPosition> LabelPosition { get; init; } = Optional<LabelPosition>.None;

    public Result Validate() {
        if (Position.IsSet) {
            var pos = Position.Value;
            if (pos.X < 0 || pos.Y < 0)
                return Result.Failure("Position coordinates must be non-negative");
        }

        if (Size.IsSet) {
            var size = Size.Value;
            if (size.Width <= 0 || size.Height <= 0)
                return Result.Failure("Size dimensions must be positive");
        }

        if (Rotation.IsSet && (Rotation.Value < 0 || Rotation.Value >= 360))
            return Result.Failure("Rotation must be between 0 and 360 degrees");

        return Result.Success();
    }
}