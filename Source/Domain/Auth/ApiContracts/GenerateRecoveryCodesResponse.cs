using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record GenerateRecoveryCodesResponse : Response {
    public string[]? RecoveryCodes { get; init; }
    public bool Success { get; init; }
    public string? Message { get; init; }
}
