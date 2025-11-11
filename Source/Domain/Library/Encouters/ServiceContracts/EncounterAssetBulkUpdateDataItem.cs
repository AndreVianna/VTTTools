namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterAssetBulkUpdateDataItem
    : Data {
    public required uint Index { get; init; }
    public Optional<Position> Position { get; init; }
    public Optional<NamedSize> Size { get; init; }
    public Optional<float> Rotation { get; init; }
    public Optional<float> Elevation { get; init; }
    public Optional<LabelVisibility> DisplayName { get; init; } = Optional<LabelVisibility>.None;
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

        return Rotation.IsSet && (Rotation.Value < 0 || Rotation.Value >= 360)
            ? Result.Failure("Rotation must be between 0 and 360 degrees")
            : Result.Success();
    }
}