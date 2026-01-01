namespace VttTools.Auth.ApiContracts;

public record GenerateRecoveryCodesRequest : Request {
    public string Password { get; init; } = string.Empty;
}