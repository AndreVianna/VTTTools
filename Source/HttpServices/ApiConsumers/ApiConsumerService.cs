namespace HttpServices.ApiConsumers;

public class ApiConsumerService<TSelf, TDatabase>(TDatabase data,
                                               IConfiguration configuration,
                                               ILogger<TSelf> logger)
    : IApiConsumerService
    where TSelf : ApiConsumerService<TSelf, TDatabase>
    where TDatabase : DbContext {
    private const int _secretSize = 128;

    public async Task<Result<RegisterClientResponse>> RegisterAsync(RegisterClientRequest request) {
        logger.LogInformation("New api consumer registration requested.");
        var result = request.Validate();
        if (result.HasErrors)
            return result.Errors.ToArray();

        var secret = StringHelpers.GenerateSecret(_secretSize);

        var consumer = new ApiConsumer {
            Name = request.Name,
            HashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
        };
        await data.Set<ApiConsumer>().AddAsync(consumer);
        await data.SaveChangesAsync();

        logger.LogInformation("New API consumer registered.");

        return new RegisterClientResponse {
            ApiConsumerId = consumer.Id,
            ApiConsumerSecret = secret,
        };
    }

    public async Task<Result<TokenResponse?>?> GenerateTokenAsync(GenerateTokenRequest request) {
        logger.LogInformation("Api token requested.");
        var result = request.Validate();
        if (result.HasErrors)
            return result.Errors.ToArray();

        var consumer = await GetAuthenticatedClientOrDefaultAsync(request.ApiConsumerId, request.ApiConsumerSecret);
        var token = CreateJwtToken(consumer, request.Name);
        if (token is null) {
            logger.LogWarning("Invalid API consumer credentials.");
            return null;
        }
        await data.Set<ApiConsumerToken>().AddAsync(token);
        await data.SaveChangesAsync();

        logger.LogInformation("Api token generated.");
        return new TokenResponse {
            Name = request.Name,
            Token = token.Value,
            Expiration = token.Expiration,
        };
    }

    private ApiConsumerToken? CreateJwtToken(ApiConsumer? client, string? name) {
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
            ApiConsumerId = client.Id,
            Name = name,
            Value = tokenHandler.WriteToken(token),
            Expiration = tokenDescriptor.Expires,
        };
    }

    private async Task<ApiConsumer?> GetAuthenticatedClientOrDefaultAsync(string id, string secret) {
        var client = await data.Set<ApiConsumer>().FindAsync(id);
        if (client is null)
            return null;
        var hashedSecret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));
        return hashedSecret != client.HashedSecret ? null : client;
    }

    Task<Result<string?>> IApiConsumerService.GenerateTokenAsync(GenerateTokenRequest request) => throw new NotImplementedException();
}
