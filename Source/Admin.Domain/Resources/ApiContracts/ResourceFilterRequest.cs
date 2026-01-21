namespace VttTools.Admin.Resources.ApiContracts;

public sealed record ResourceFilterRequest : Request {
    public ResourceRole? Role { get; init; }
    public string? SearchText { get; init; }
    public int? Skip { get; init; } = 0;
    public int? Take { get; init; } = 50;
}