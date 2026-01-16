namespace VttTools.Media.ApiContracts;

public sealed record ResourceFilterRequest
    : Request {
    public ResourceRole? Role { get; init; }
    public string? SearchText { get; init; }
    public string[]? MediaTypes { get; init; }
    public int? MinWidth { get; init; }
    public int? MaxWidth { get; init; }
    public int? MinDurationMs { get; init; }
    public int? MaxDurationMs { get; init; }
    public Guid? OwnerId { get; init; }
    public int? Skip { get; init; }
    public int? Take { get; init; }
}