namespace VttTools.Library.Scenes.ApiContracts;

public record CreateSceneRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? StageId { get; init; }
    public Grid Grid { get; init; } = new();
}