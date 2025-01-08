namespace HttpServices.Services.Token;

internal sealed class TokenService<TDatabase>(TDatabase data,
                                              IConfiguration configuration,
                                              ICacheService cache,
                                              ILogger<TokenService<TDatabase>> logger)
    : ITokenService
    where TDatabase : DbContext {
    private const string _clientIdClaimType = "x-api-client-id";

    public async Task<NewTokenResponse?> GenerateTokenAsync(HttpContext context, NewTokenRequest request, CancellationToken ct = default) {
        logger.LogInformation("New API token requested.");
        if (!TryExtractValuesFromHeader(context, out var clientId))
            return null;

        var client = await data.Set<ApiClient>().FirstOrDefaultAsync(e => e.Id == clientId, ct);
        if (client is null)
            return null;

        var now = DateTime.UtcNow;
        var expiration = request.ExpirationInSeconds.HasValue
                             ? now.AddSeconds(request.ExpirationInSeconds.Value)
                             : (DateTime?)null;
        var jwt = Base64UrlEncoder.Encode(CreateJwtToken(clientId, request.ExpirationInSeconds));
        var token = new ApiToken {
            ClientId = clientId,
            Expiration = expiration,
            Value = $"sk-api-{jwt}",
            Name = request.Name,
        };

        await data.Set<ApiToken>().AddAsync(token, ct);
        await data.SaveChangesAsync(ct);
        await cache.AddTokenAsync(clientId, token, ct);
        return new() {
            Token = token.Value,
            Expiration = token.Expiration,
        };
    }

    public async Task<TokenResponse?> GetTokenAsync(HttpContext context, CancellationToken ct = default) {
        logger.LogInformation("API token requested.");
        if (!TryExtractValuesFromHeader(context, out var clientId))
            return null;

        var client = await data.Set<ApiClient>().FirstOrDefaultAsync(e => e.Id == clientId, ct);
        if (client is null)
            return null;

        var tolerance = DateTime.UtcNow.AddSeconds(1);
        var token = await GetOrAddCachedToken(clientId, tolerance, ct);
        return token is null
                   ? null
                   : CreateResponse(token);

        static TokenResponse CreateResponse(ApiToken token)
            => new() {
                Token = $"sk-...{token.Value[^4..]}",
                Name = token.Name ?? "API Token",
                Expiration = token.Expiration,
            };
    }

    private async Task<ApiToken?> GetOrAddCachedToken(string clientId, DateTime tolerance, CancellationToken ct) {
        var token = await cache.FindTokenAsync(clientId, ct);
        if (token is null)
            return null;
        if (token.Expiration > tolerance)
            return token;
        await cache.RemoveTokenAsync(clientId, ct);
        token = await data.Set<ApiToken>()
                          .Where(t => t.ClientId == clientId
                                   && t.Expiration > tolerance)
                          .OrderByDescending(t => t.Id)
                          .FirstOrDefaultAsync(ct);
        if (token is null)
            return null;
        await cache.AddTokenAsync(clientId, token, ct);
        return token;
    }

    private string CreateJwtToken(string clientId, int? expirationInSeconds) {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var tokenHandler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key);
        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor {
            Issuer = jwtSettings.Issuer,
            Audience = jwtSettings.Audience,
            IssuedAt = now,
            Expires = expirationInSeconds.HasValue ? now.AddSeconds(expirationInSeconds.Value) : null,
            TokenType = "ApiAccess",
            SigningCredentials = new(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature),
        };
        tokenDescriptor.Claims.Add(_clientIdClaimType, clientId);
        var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private static string? ReadClientIdFromApiTokenOrDefault(string apiToken) {
        if (!apiToken.StartsWith("sk-api-")) return null;
        var jwt = Base64UrlEncoder.Decode(apiToken[7..]);
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.ReadJwtToken(jwt);
        return token.Claims.FirstOrDefault(c => c.Type == _clientIdClaimType)?.Value;
    }

    private static bool TryExtractValuesFromHeader(HttpContext context, [NotNullWhen(true)] out string? clientId) {
        clientId = null;
        try {
            var headers = context.Request.Headers;
            if (string.IsNullOrWhiteSpace(headers.Authorization)
             || !AuthenticationHeaderValue.TryParse(headers.Authorization!, out var authHeader)
             || authHeader.Scheme != "Basic"
             || string.IsNullOrWhiteSpace(authHeader.Parameter)) {
                return false;
            }

            clientId = ReadClientIdFromApiTokenOrDefault(authHeader.Parameter);
            return clientId is not null;
        }
        catch {
            return false;
        }
    }
}
