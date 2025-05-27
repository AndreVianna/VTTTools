namespace VttTools.WebApp.Contracts.Library.Scenes;

public record SceneDetails {
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsPublished { get; set; }
    public StageDetails Stage { get; init; } = new();
    public GridDetails Grid { get; init; } = new();
    public float ZoomLevel { get; init; }
    public List<SceneAssetDetails> Assets { get; init; } = [];
}