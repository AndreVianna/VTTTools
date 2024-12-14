namespace AuthService.Services;

public class UserService(UserManager<ApplicationUser> userManager)
    : IUserService {
    public Task<ApplicationUser?> GetUserAsync(string id)
        => userManager.FindByIdAsync(id);
}
