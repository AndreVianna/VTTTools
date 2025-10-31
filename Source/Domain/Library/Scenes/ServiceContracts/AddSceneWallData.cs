namespace VttTools.Library.Scenes.ServiceContracts;

public record AddSceneWallData
    : Data {
    public string Name { get; init; } = string.Empty;
    public required List<Pole> Poles { get; init; }
    public required WallVisibility Visibility { get; init; }
    public required bool IsClosed { get; init; }
    public string? Material { get; init; }
    public string? Color { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Material?.Length > 32)
            result += new Error("Wall material must not exceed 32 characters.", nameof(Material));
        if (Color?.Length > 16)
            result += new Error("Wall color must not exceed 16 characters.", nameof(Color));
        return result;
    }
}