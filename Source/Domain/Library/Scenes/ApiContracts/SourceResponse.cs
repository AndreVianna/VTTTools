namespace VttTools.Library.Scenes.ApiContracts;

public record SourceResponse {
    public Guid Id { get; init; }
    public Guid OwnerId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string SourceType { get; init; } = string.Empty;
    public decimal DefaultRange { get; init; }
    public decimal DefaultIntensity { get; init; }
    public bool DefaultIsGradient { get; init; }
    public DateTime CreatedAt { get; init; }
}