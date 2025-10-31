namespace VttTools.Auth.ApiContracts;

public record SecuritySettingsResponse : Response {
    public bool HasPassword { get; init; }
    public bool TwoFactorEnabled { get; init; }
    public int RecoveryCodesRemaining { get; init; }
    public bool Success { get; init; }
    public string? Message { get; init; }
}