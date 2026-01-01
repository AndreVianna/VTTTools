namespace VttTools.Library.Worlds.ApiContracts;

public record CreateWorldRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundId { get; init; }
}