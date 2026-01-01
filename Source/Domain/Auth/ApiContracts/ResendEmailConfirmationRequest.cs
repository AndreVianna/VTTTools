namespace VttTools.Auth.ApiContracts;

public record ResendEmailConfirmationRequest : Request {
    public string Email { get; init; } = string.Empty;
}