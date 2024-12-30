
namespace AuthService.Services;

public interface IUserService {
    Task<User?> GetUserAsync(string id);
}