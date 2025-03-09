namespace HttpServices.Identity.Contracts;

public sealed record SignInResponse {
    public required string Token { get; init; }
    public bool RequiresTwoFactor { get; init; }
    public bool RequiresConfirmation { get; init; }
}