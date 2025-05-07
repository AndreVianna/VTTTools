namespace VttTools.Library.Scenes.ServiceContracts;

public record AddSceneAssetData
    : Data {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Position Position { get; init; } = new();
    public double Scale { get; init; } = 1.0;

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Scale <= 0)
            result += new Error("The scene asset scale must be greater than zero.", nameof(Scale));
        return result;
    }
}