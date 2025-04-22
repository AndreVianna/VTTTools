namespace VttTools.Contracts.Game;

public record UpdateEpisodeAssetData
    : Data {
    public Optional<Position> Position { get; init; } = Optional<Position>.None;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Position is { IsSet: true, Value: null })
            result += new Error("The episode asset position cannot be null.", nameof(Position));
        return result;
    }
}