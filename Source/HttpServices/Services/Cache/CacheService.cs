﻿// ReSharper disable once CheckNamespace
namespace ApiService.Services.Cache;

public class CacheService(IDistributedCache cache)
    : ICacheService {
    public async Task AddTokenAsync(string clientId, string token, DateTimeOffset expiration, CancellationToken ct = default) {
        var options = new DistributedCacheEntryOptions { AbsoluteExpiration = expiration };
        await cache.SetStringAsync($"jwt:{clientId}", token, options, ct);
    }

    public Task<string?> FindTokenAsync(string clientId, CancellationToken ct = default)
        => cache.GetStringAsync($"jwt:{clientId}", ct);
}
