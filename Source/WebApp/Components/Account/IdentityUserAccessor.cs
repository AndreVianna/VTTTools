namespace WebApp.Components.Account;

internal sealed class IdentityUserAccessor(IdentityRedirectManager redirectManager) {
    public async Task<Result<User>> GetRequiredUserOrRedirectAsync(HttpContext context, UserManager<User> userManager) {
        var user = await userManager.GetUserAsync(context.User);
        if (user is not null)
            return user;
        redirectManager.RedirectToWithStatus("Account/InvalidUser", $"Error: Unable to load user with ID '{context.User.Identity!.Name}'.", context);
        return Result.Failure("Invalid user.");
    }
}
