// ReSharper disable once CheckNamespace
namespace Microsoft.Extensions.Caching;

public interface ICacheService {
    Task StoreJwtAsync(string clientId, string token, DateTimeOffset expiration, CancellationToken ct = default);
    Task<string?> RetrieveJwtAsync(string clientId, CancellationToken ct = default);
}
