namespace VttTools.Auth.ApiContracts;

public record VerifySetupRequest : Request {
    public string Code { get; init; } = string.Empty;
}