// ReSharper disable once CheckNamespace
namespace Microsoft.AspNetCore.Builder;

internal static class WebApplicationExtensions {
    public static void MapDefaultEndpoints(this WebApplication app) {
        if (!app.Environment.IsDevelopment())
            return;
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() { Predicate = r => r.Tags.Contains("live") });
    }

    public static void MapAuthEndpoints(this WebApplication app) {
        app.MapGet("/users/{id}", [Authorize] async (IUserService service, string id) => {
            var session = await service.GetUserAsync(id);
            return session != null ? Results.Ok(session) : Results.NotFound();
        });

        app.MapPost("/token", async (HttpContext context, IConfiguration configuration, IJwtService jwt, ICacheService cache) => {
            if (!context.Request.Headers.TryGetValue("ClientId", out var clientId) ||
                !context.Request.Headers.TryGetValue("ClientSecret", out var clientSecret) ||
                !await jwt.IsClientCredentialsValidAsync(clientId!, clientSecret!)) {
                return Results.Unauthorized();
            }
            Ensure.IsNotNull(clientId);

            var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
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

            return Results.Ok(new { Token = tokenString, tokenDescriptor.Expires });
        });
    }
}
