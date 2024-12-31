namespace AuthService.Services;

public class CacheService(IDistributedCache cache)
    : ICacheService {
    public async Task StoreJwtAsync(string clientId, string token, DateTimeOffset expiration, CancellationToken ct = default) {
        var options = new DistributedCacheEntryOptions { AbsoluteExpiration = expiration };
        await cache.SetStringAsync($"jwt:{clientId}", token, options, ct);
    }

    public Task<string?> RetrieveJwtAsync(string clientId, CancellationToken ct = default)
        => cache.GetStringAsync($"jwt:{clientId}", ct);
}
