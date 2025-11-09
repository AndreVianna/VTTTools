namespace VttTools.Library.Epics.ApiContracts;

public record UpdateEpicRequest
    : Request {
    [MaxLength(128)]
    public Optional<string> Name { get; init; }
    [MaxLength(4096)]
    public Optional<string> Description { get; init; }
    public Optional<Guid?> BackgroundId { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }
}
