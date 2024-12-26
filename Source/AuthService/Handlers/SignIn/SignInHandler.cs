using IResult = Microsoft.AspNetCore.Http.IResult;

namespace AuthService.Handlers;

internal static class SignInHandler {
    public static void MapClientConnectionEndpoints(this WebApplication app)
        => app.MapPost("/token", GenerateTokenAsync);

    private static async Task<IResult> GenerateTokenAsync(HttpContext context,
                                                         IConfiguration configuration,
                                                         IJwtService jwt,
                                                         ICacheService cache) {
        var headers = context.Request.Headers;
        if (!headers.TryGetValue("ClientId", out var clientId)
         || !headers.TryGetValue("ClientSecret", out var clientSecret)
         || !await jwt.IsClientCredentialsValidAsync(clientId!, clientSecret!)) {
            return Results.Unauthorized();
        }

        Ensure.IsNotNull(clientId);

        var jwtSettings = configuration.GetSection("Jwt")
                                       .Get<JwtSettings>()!;
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSettings.Key);
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new([new("ClientId", clientId!)]),
            Expires = DateTime.UtcNow.AddMinutes(jwtSettings.ExpirationMinutes),
            SigningCredentials = new(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings.Issuer,
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        await cache.StoreJwtAsync(clientId!, tokenString, tokenDescriptor.Expires!.Value);
        return Results.Ok(new {
            tokenString,
            tokenDescriptor.Expires!.Value,
        });
    }
}
