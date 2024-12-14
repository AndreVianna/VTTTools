namespace Domain.Auth;

public class JwtSettings {
    public required string Key { get; init; }
    public required string Issuer { get; init; }
    public int ExpirationMinutes { get; init; } = 60; // Default to 1 hour if not specified
}
