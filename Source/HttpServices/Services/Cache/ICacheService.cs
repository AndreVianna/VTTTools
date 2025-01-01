// ReSharper disable once CheckNamespace
namespace ApiService.Services.Cache;

public interface ICacheService {
    Task AddTokenAsync(string clientId, string token, DateTimeOffset expiration, CancellationToken ct = default);
    Task<string?> FindTokenAsync(string clientId, CancellationToken ct = default);
}
