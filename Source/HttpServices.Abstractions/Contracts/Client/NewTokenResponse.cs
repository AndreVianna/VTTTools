namespace HttpServices.Abstractions.Contracts.Client;

public sealed record NewTokenResponse {
    public required string Token { get; init; }
    public DateTimeOffset? Expiration { get; init; }
}