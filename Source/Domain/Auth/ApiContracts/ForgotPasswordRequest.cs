namespace VttTools.Auth.ApiContracts;

public record ForgotPasswordRequest : Request {
    public string Email { get; init; } = string.Empty;
}