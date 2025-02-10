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

        var client = new ApiClient {
            Name = request.Name,
            HashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
        };
        await data.Set<ApiClient>().AddAsync(client);
        await data.SaveChangesAsync();

        logger.LogInformation("New api client registered.");

        return new RegisterClientResponse {
            ClientId = client.Id,
            ClientSecret = secret,
        };
    }

    public async Task<Result<TokenResponse?>?> GenerateTokenAsync(GenerateTokenRequest request) {
        logger.LogInformation("Api token requested.");
        var validationResult = request.Validate();
        if (validationResult.HasErrors)
            return validationResult.Errors;

        var client = await GetAuthenticatedClientOrDefaultAsync(request.ClientId, request.ClientSecret);
        var token = CreateJwtToken(client, request.Name);
        if (token is null) {
            logger.LogWarning("Invalid client credentials.");
            return null;
        }
        await data.Set<ApiToken>().AddAsync(token);
        await data.SaveChangesAsync();

        logger.LogInformation("Api token generated.");
        return new TokenResponse {
            Name = request.Name,
            Token = token.Value,
            Expiration = token.Expiration,
        };
    }

    private ApiToken? CreateJwtToken(ApiClient? client, string? name) {
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
        return new() {
            ApiClientId = client.Id,
            Name = name,
            Value = tokenHandler.WriteToken(token),
            Expiration = tokenDescriptor.Expires,
        };
    }

    private async Task<ApiClient?> GetAuthenticatedClientOrDefaultAsync(string id, string secret) {
        var client = await data.Set<ApiClient>().FindAsync(id);
        if (client is null)
            return null;
        var hashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
        return hashedSecret != client.HashedSecret ? null : client;
    }

    Task<Result<string?>> IClientService.GenerateTokenAsync(GenerateTokenRequest request) => throw new NotImplementedException();
}
