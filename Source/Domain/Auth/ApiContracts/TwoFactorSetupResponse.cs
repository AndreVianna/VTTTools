namespace VttTools.Auth.ApiContracts;

using VttTools.Common.ApiContracts;

public record TwoFactorSetupResponse : Response {
    public string SharedKey { get; init; } = string.Empty;
    public string AuthenticatorUri { get; init; } = string.Empty;
    public bool Success { get; init; }
    public string? Message { get; init; }
}
