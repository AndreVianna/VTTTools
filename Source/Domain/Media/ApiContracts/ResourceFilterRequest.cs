namespace VttTools.Media.ApiContracts;

public sealed record ResourceFilterRequest
    : Request {
    public ResourceRole? Role { get; init; }
    public string? SearchText { get; init; }
    public int? Skip { get; init; }
    public int? Take { get; init; }
}