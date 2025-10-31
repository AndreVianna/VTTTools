using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record RecoveryCodesStatusResponse : Response {
    public int RemainingCount { get; init; }
    public bool Success { get; init; }
    public string? Message { get; init; }
}
