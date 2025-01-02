namespace HttpServices.Services.Token;

internal sealed class TokenService<TDatabase>(TDatabase data,
                                              IConfiguration configuration,
                                              ICacheService cache,
                                              ILogger<TokenService<TDatabase>> logger)
    : ITokenService
    where TDatabase : DbContext {
    public async Task<string?> GenerateClientTokenAsync(HttpContext context) {
        logger.LogInformation("Api token requested.");
        if (!TryExtractValuesFromHeader(context, out var clientId, out var clientSecret))
            return null;

        var client = await GetAuthenticatedClientOrDefaultAsync(clientId, clientSecret);
        if (client is null)
            return null;

        (var token, var expiration) = CreateJwtToken();

        await cache.AddTokenAsync(clientId!, token, expiration);
        return token;
    }

    private (string token, DateTime expiration) CreateJwtToken() {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var tokenHandler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key);
        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor {
            Issuer = jwtSettings.Issuer,
            Audience = jwtSettings.Audience,
            IssuedAt = now,
            Expires = now.AddMinutes(jwtSettings.ExpirationMinutes),
            TokenType = "Clients",
            SigningCredentials = new(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature),
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);
        return (tokenString, tokenDescriptor.Expires!.Value);
    }

    private async Task<Abstractions.Model.Client?> GetAuthenticatedClientOrDefaultAsync(string id, string secret) {
        var client = await data.Set<Abstractions.Model.Client>().FindAsync(id);
        if (client is null)
            return null;
        var hashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
        return hashedSecret != client.HashedSecret ? null : client;
    }

    private static bool TryExtractValuesFromHeader(HttpContext context, [NotNullWhen(true)] out string? clientId, [NotNullWhen(true)] out string? clientSecret) {
        clientId = null!;
        clientSecret = null!;
        try {
            var headers = context.Request.Headers;
            if (string.IsNullOrWhiteSpace(headers.Authorization)
             || !AuthenticationHeaderValue.TryParse(headers.Authorization!, out var authHeader)
             || authHeader.Scheme != "Basic"
             || string.IsNullOrWhiteSpace(authHeader.Parameter)) {
                return false;
            }

            var content = Encoding.UTF8.GetString(Convert.FromBase64String(authHeader.Parameter));
            var parts = content.Split(':');
            if (parts.Length < 2
             || string.IsNullOrWhiteSpace(parts[0])
             || string.IsNullOrWhiteSpace(parts[1])) {
                return false;
            }

            clientId = parts[0];
            clientSecret = parts[1];
            return true;
        }
        catch {
            return false;
        }
    }
}
