namespace VttTools.AI.Model;

public record AiProviderModel {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public Guid ProviderId { get; init; }
    public GeneratedContentType Category { get; init; }
    public string ModelName { get; init; } = string.Empty;
    public string Endpoint { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public bool IsEnabled { get; init; } = true;
}
