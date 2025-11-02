
namespace VttTools.Admin.Services;

public interface IAdminAuthService {
    Task<AdminLoginResponse> LoginAsync(AdminLoginRequest request, CancellationToken ct = default);
    Task<AdminLoginResponse> LogoutAsync(CancellationToken ct = default);
    Task<AdminUserInfo?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task<AdminSessionResponse> GetSessionStatusAsync(CancellationToken ct = default);
}
