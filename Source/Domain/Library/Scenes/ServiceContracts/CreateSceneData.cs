namespace VttTools.Library.Scenes.ServiceContracts;

public record CreateSceneData
    : Data {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? StageId { get; init; }
    public Grid Grid { get; init; } = new();

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The scene description cannot be null or empty.", nameof(Description));
        return result;
    }
}
