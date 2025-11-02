namespace VttTools.Auth.Services;

public interface ISecurityService {
    Task<SecuritySettingsResponse> GetSecuritySettingsAsync(Guid userId, CancellationToken ct = default);
}