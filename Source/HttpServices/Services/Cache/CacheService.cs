using System.Text.Json;

// ReSharper disable once CheckNamespace
namespace ApiService.Services.Cache;

public class CacheService(IDistributedCache cache)
    : ICacheService {
    public Task AddTokenAsync(string clientId, ApiToken token, CancellationToken ct = default) {
        var options = new DistributedCacheEntryOptions { AbsoluteExpiration = token.Expiration };
        return cache.SetStringAsync($"jwt:{clientId}", JsonSerializer.Serialize(token), options, ct);
    }

    public Task RemoveTokenAsync(string clientId, CancellationToken ct = default)
        => cache.RemoveAsync($"jwt:{clientId}", ct);

    public async Task<ApiToken?> FindTokenAsync(string clientId, CancellationToken ct = default) {
        var json = await cache.GetStringAsync($"jwt:{clientId}", ct);
        return json is null ? null : JsonSerializer.Deserialize<ApiToken>(json);
    }
}
