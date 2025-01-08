namespace HttpServices.Abstractions.Contracts.Client;

public sealed record NewTokenRequest {
    public required string Name { get; init; }
    public int? ExpirationInSeconds { get; init; }
}