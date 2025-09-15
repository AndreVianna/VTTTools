using VttTools.Auth.ApiContracts;

namespace VttTools.Auth.Services;

public interface IAuthService {
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LogoutAsync();
    Task<AuthResponse> GetCurrentUserAsync(Guid userId);
}