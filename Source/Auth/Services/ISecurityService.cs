namespace VttTools.Auth.Services;

using VttTools.Auth.ApiContracts;

public interface ISecurityService {
    Task<SecuritySettingsResponse> GetSecuritySettingsAsync(Guid userId, CancellationToken ct = default);
    Task<PasswordChangeResponse> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
}