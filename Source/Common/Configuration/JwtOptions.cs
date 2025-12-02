namespace VttTools.Configuration;

public sealed class JwtOptions {
    public required string SecretKey {
        get;
        init {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("JWT SecretKey cannot be empty", nameof(SecretKey));

            if (value.Length < 32)
                throw new ArgumentException("JWT SecretKey must be at least 32 characters long", nameof(SecretKey));

            field = value;
        }
    } = string.Empty;

    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpirationMinutes { get; init; } = 60;
    public int RememberMeExpirationMinutes { get; init; } = 43200;

    public void ValidateForProduction() {
        if (SecretKey.Contains("development", StringComparison.OrdinalIgnoreCase) ||
            SecretKey.Contains("change-this", StringComparison.OrdinalIgnoreCase) ||
            SecretKey.Contains("change-in-production", StringComparison.OrdinalIgnoreCase)) {
            throw new InvalidOperationException(
                "CRITICAL SECURITY ERROR: Open development JWT SecretKey detected in production environment. " +
                "Update the JWT:SecretKey configuration with a cryptographically secure random key.");
        }
    }
}
