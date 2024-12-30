namespace AuthService.Services;

public class UserService(UserManager<User> userManager)
    : IUserService {
    public Task<User?> GetUserAsync(string id)
        => userManager.FindByIdAsync(id);
}
