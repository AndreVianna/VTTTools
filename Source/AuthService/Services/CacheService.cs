namespace AuthService.Services;

public class CacheService(IConnectionMultiplexer redis) : ICacheService {
    private readonly IDatabase _redisDatabase = redis.GetDatabase();

    public Task StoreJwtAsync(string clientId, string token, DateTimeOffset expiration)
        => _redisDatabase.StringSetAsync($"jwt:{clientId}", token, expiration - DateTimeOffset.UtcNow);

    public async Task<string?> RetrieveJwtAsync(string clientId) => await _redisDatabase.StringGetAsync($"jwt:{clientId}");
}
