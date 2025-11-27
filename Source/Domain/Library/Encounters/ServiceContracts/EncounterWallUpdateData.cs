namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterWallUpdateData
    : Data {
    public Optional<string> Name { get; init; }
    public Optional<List<Pole>> Poles { get; init; }
    public Optional<WallVisibility> Visibility { get; init; }
    public Optional<bool> IsClosed { get; init; }
    public Optional<string?> Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Color.IsSet && Color.Value?.Length > 16)
            result += new Error("Wall color must not exceed 16 characters.", nameof(Color));
        return result;
    }
}