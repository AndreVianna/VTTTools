namespace AuthService.Services;

public interface ICacheService {
    Task StoreJwtAsync(string clientId, string token, DateTimeOffset expiration);
    Task<string?> RetrieveJwtAsync(string clientId);
}
