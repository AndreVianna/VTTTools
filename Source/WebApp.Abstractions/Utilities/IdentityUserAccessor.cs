namespace VttTools.WebApp.Utilities;

public sealed class IdentityUserAccessor(IHttpContextAccessor httpContextAccessor, UserManager<User> userManager, NavigationManager navigationManager)
    : IIdentityUserAccessor {
    public async Task<Result<User>> GetCurrentUserOrRedirectAsync() {
        var context = httpContextAccessor.HttpContext!;
        var user = await userManager.GetUserAsync(context.User);
        if (user is not null)
            return user;
        context.SetStatusMessage($"Error: Unable to load user with ID '{context.User.Identity!.Name}'.");
        navigationManager.ReplaceWith("account/invalid_user");
        return new InputError("User not found.");
    }
}