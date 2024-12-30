using Client = AuthService.Data.Model.ApiClient;
using IResult = Microsoft.AspNetCore.Http.IResult;

namespace AuthService.Handlers.ApiClient;

internal static class ApiClientHandler {
    public static async Task<IResult> GenerateTokenAsync(HttpContext context,
                                                         AuthDbContext data,
                                                         IConfiguration configuration,
                                                         ICacheService cache) {
        if (!TryExtractValuesFromHeader(context, out var clientId, out var clientSecret))
            return Results.Unauthorized();

        var client = await GetAuthenticatedClientOrDefaultAsync(data, clientId, clientSecret);
        if (client is null)
            return Results.Unauthorized();

        (var token, var expiration) = CreateJwtToken(configuration, client);

        await cache.StoreJwtAsync(clientId!, token, expiration);
        return Results.Ok(token);
    }

    private static (string token, DateTime expiration) CreateJwtToken(IConfiguration configuration, Client client) {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
        var tokenDescriptor = new SecurityTokenDescriptor {
            Issuer = jwtSettings.Issuer,
            Audience = client.Name,
            Expires = DateTime.UtcNow.AddMinutes(jwtSettings.ExpirationMinutes),
            IssuedAt = DateTime.UtcNow,
            TokenType = "ApiClient",
            SigningCredentials = new(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);
        return (tokenString, tokenDescriptor.Expires!.Value);
    }

    private static async Task<Client?> GetAuthenticatedClientOrDefaultAsync(AuthDbContext data, string id, string secret) {
        var client = await data.Clients.FindAsync(id);
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
