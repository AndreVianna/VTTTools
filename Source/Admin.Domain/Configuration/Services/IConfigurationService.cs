namespace VttTools.Admin.Configuration.Services;

public interface IConfigurationService {
    Task<ConfigurationResponse> GetServiceConfigurationAsync(string serviceName, CancellationToken ct = default);
    Task<string> RevealConfigValueAsync(Guid userId, string serviceName, string key, string totpCode, CancellationToken ct = default);
}