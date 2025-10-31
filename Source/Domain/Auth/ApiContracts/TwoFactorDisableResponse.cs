using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record TwoFactorDisableResponse : Response {
    public bool Success { get; init; }
    public string? Message { get; init; }
}
