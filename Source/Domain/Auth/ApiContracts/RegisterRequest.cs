namespace VttTools.Auth.ApiContracts;

public record RegisterRequest : Request {
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string ConfirmPassword { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
}