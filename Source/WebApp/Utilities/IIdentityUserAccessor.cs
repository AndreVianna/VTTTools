namespace VttTools.WebApp.Utilities;

public interface IIdentityUserAccessor {
    Task<Result<User>> GetCurrentUserOrRedirectAsync(HttpContext context, UserManager<User> userManager);
}