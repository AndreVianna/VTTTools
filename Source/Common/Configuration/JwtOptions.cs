namespace VttTools.Configuration;

public sealed class JwtOptions {
    private string _secretKey = string.Empty;

    public string SecretKey {
        get => _secretKey;
        set {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("JWT SecretKey cannot be empty", nameof(SecretKey));

            if (value.Length < 32)
                throw new ArgumentException("JWT SecretKey must be at least 32 characters long", nameof(SecretKey));

            _secretKey = value;
        }
    }

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
    public int RememberMeExpirationMinutes { get; set; } = 43200;

    public void Validate() {
        if (string.IsNullOrWhiteSpace(SecretKey))
            throw new InvalidOperationException("JWT SecretKey is not configured. Add Jwt:SecretKey to your configuration.");

        if (SecretKey.Length < 32)
            throw new InvalidOperationException("JWT SecretKey must be at least 32 characters long.");

        if (string.IsNullOrWhiteSpace(Issuer))
            throw new InvalidOperationException("JWT Issuer is not configured. Add Jwt:Issuer to your configuration.");

        if (string.IsNullOrWhiteSpace(Audience))
            throw new InvalidOperationException("JWT Audience is not configured. Add Jwt:Audience to your configuration.");
    }

    public void ValidateForProduction() {
        Validate();

        if (SecretKey.Contains("development", StringComparison.OrdinalIgnoreCase) ||
            SecretKey.Contains("change-this", StringComparison.OrdinalIgnoreCase) ||
            SecretKey.Contains("change-in-production", StringComparison.OrdinalIgnoreCase)) {
            throw new InvalidOperationException(
                "CRITICAL SECURITY ERROR: Open development JWT SecretKey detected in production environment. " +
                "Update the JWT:SecretKey configuration with a cryptographically secure random key.");
        }
    }
}