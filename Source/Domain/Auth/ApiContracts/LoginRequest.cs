namespace VttTools.Auth.ApiContracts;

public record LoginRequest : Request {
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public bool RememberMe { get; init; }
}