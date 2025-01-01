namespace HttpServices.Abstractions.Model;

public class JwtSettings {
    public string Key { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpirationMinutes { get; init; } = 30; // Default to 1 hour if not specified
}
