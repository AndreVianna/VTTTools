namespace VttTools.Auth.ApiContracts;

public record DisableTwoFactorRequest : Request {
    public string Password { get; init; } = string.Empty;
}