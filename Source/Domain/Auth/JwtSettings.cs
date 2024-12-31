namespace Domain.Auth;

public class JwtSettings {
    public required string Key { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpirationMinutes { get; init; } = 30; // Default to 1 hour if not specified
}
