namespace WebApi.Contracts;

public sealed record SignInResponse {
    public required string Token { get; init; }
    public DateTimeOffset? TokenExpiration { get; init; }
    public bool RequiresTwoFactor { get; init; }
    public bool RequiresConfirmation { get; init; }
}