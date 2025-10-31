namespace VttTools.Auth.ApiContracts;

using VttTools.Common.ApiContracts;

public record TwoFactorVerifyResponse : Response {
    public string[]? RecoveryCodes { get; init; }
    public bool Success { get; init; }
    public string? Message { get; init; }
}
