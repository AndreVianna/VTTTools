namespace HttpServices.Abstractions.Contracts.Client;

public sealed record TokenResponse {
    public string? Name { get; init; }
    public required string Token { get; init; }
    public DateTimeOffset? Expiration { get; init; }
}