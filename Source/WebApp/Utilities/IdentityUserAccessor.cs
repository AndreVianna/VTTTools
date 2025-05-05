namespace VttTools.WebApp.Utilities;

internal sealed class IdentityUserAccessor(HttpContext context, UserManager<User> userManager, NavigationManager navigationManager)
    : IIdentityUserAccessor {
    public async Task<Result<User>> GetCurrentUserOrRedirectAsync() {
        var user = await userManager.GetUserAsync(context.User);
        if (user is not null)
            return user;
        context.SetStatusMessage($"Error: Unable to load user with ID '{context.User.Identity!.Name}'.");
        navigationManager.ReplaceWith("account/invalid_user");
        return new Error("User not found.");
    }
}