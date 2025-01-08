// ReSharper disable once CheckNamespace
namespace ApiService.Services.Cache;

public interface ICacheService {
    Task AddTokenAsync(string clientId, ApiToken token, CancellationToken ct = default);
    Task RemoveTokenAsync(string clientId, CancellationToken ct = default);
    Task<ApiToken?> FindTokenAsync(string clientId, CancellationToken ct = default);
}
