namespace VttTools.WebApp.Utilities;

internal sealed class IdentityUserAccessor(NavigationManager navigationManager)
    : IIdentityUserAccessor {
    public async Task<Result<User>> GetCurrentUserOrRedirectAsync(HttpContext context, UserManager<User> userManager) {
        var user = await userManager.GetUserAsync(context.User);
        if (user is not null)
            return user;
        navigationManager.RedirectToWithStatus("account/invalid_user", $"Error: Unable to load user with ID '{context.User.Identity!.Name}'.", context);
        return Result.Failure("Invalid user.");
    }
}