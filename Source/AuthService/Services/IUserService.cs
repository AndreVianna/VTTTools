

namespace AuthService.Services;

public interface IUserService {
    Task<ApplicationUser?> GetUserAsync(string id);
}