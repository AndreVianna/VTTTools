namespace VttTools.AI.Model;

public record AiProvider {
    public Guid Id { get; init; } = Guid.CreateVersion7();
    public string Name { get; init; } = string.Empty;
    public string BaseUrl { get; init; } = string.Empty;
    public string HealthEndpoint { get; init; } = string.Empty;
    public bool IsEnabled { get; init; } = true;
}
