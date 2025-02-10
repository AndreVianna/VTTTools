namespace HttpServices.Services.Client;

internal sealed class ClientService<TDatabase>(TDatabase data,
                                               IConfiguration configuration,
                                               ILogger<ClientService<TDatabase>> logger)
    : IClientService
    where TDatabase : DbContext {
    private const int _secretSize = 128;

    public async Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request) {
        logger.LogInformation("New api client registration requested.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var secret = StringHelpers.GenerateSecret(_secretSize);

        var client = new Abstractions.Model.Client {
            Name = request.Name,
            HashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
        };
        await data.Set<Abstractions.Model.Client>().AddAsync(client);

        logger.LogInformation("New api client registered.");

        return new RegisterClientResponse {
            ClientId = client.Id,
            ClientSecret = secret,
        };
    }

    public async Task<Result<string?>> GenerateTokenAsync(GenerateTokenRequest request) {
        logger.LogInformation("Api token requested.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var client = await GetAuthenticatedClientOrDefaultAsync(request.ClientId, request.ClientSecret);
        return CreateJwtToken(client);
    }

    private string? CreateJwtToken(Abstractions.Model.Client? client) {
        if (client is null)
            return null;
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()!;
        var tokenHandler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(jwtSettings.Key);
        var now = DateTime.UtcNow;
        var tokenDescriptor = new SecurityTokenDescriptor {
            Subject = new(),
            Issuer = jwtSettings.Issuer,
            Audience = jwtSettings.Audience,
            IssuedAt = now,
            Expires = now.AddMinutes(jwtSettings.ExpirationMinutes),
            TokenType = "Client",
            SigningCredentials = new(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature),
        };
        tokenDescriptor.Claims.Add(ClaimTypes.NameIdentifier, client.Id);
        tokenDescriptor.Claims.Add(ClaimTypes.Name, client.Name);
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task<Abstractions.Model.Client?> GetAuthenticatedClientOrDefaultAsync(string id, string secret) {
        var client = await data.Set<Abstractions.Model.Client>().FindAsync(id);
        if (client is null)
            return null;
        var hashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
        return hashedSecret != client.HashedSecret ? null : client;
    }
}
