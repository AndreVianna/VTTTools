namespace WebApi.Contracts;

/// <summary>
/// Represents the response containing access and optionally refresh token.
/// </summary>
public record AccessTokenResponse {
    public required Guid Id { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required string Type { get; init; }
    public required string Value { get; init; }
    public DateTimeOffset? ValidUntil { get; init; }
    public DateTimeOffset? DelayStartUntil { get; init; }
    public DateTimeOffset? CanRefreshUntil { get; init; }
}
