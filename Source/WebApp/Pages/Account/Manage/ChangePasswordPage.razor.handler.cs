namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandler(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : AuthorizedComponentHandler<ChangePasswordPageHandler, ChangePasswordPage>(httpContext, navigationManager, currentUser, loggerFactory) {
    private UserManager<User> _userManager = null!;
    private SignInManager<User> _signInManager = null!;

    internal ChangePasswordPageState State { get; } = new();

    public bool Configure(UserManager<User> userManager, SignInManager<User> signInManager) {
        _userManager = userManager;
        _signInManager = signInManager;
        if (CurrentUser.HasPassword)
            return true;
        NavigationManager.RedirectTo("account/manage/set_password");
        return false;
    }

    public async Task<bool> ChangePasswordAsync() {
        var changePasswordResult = await _userManager.ChangePasswordAsync(
            CurrentUser,
            State.Input.CurrentPassword,
            State.Input.NewPassword);

        if (!changePasswordResult.Succeeded) {
            State.Input.Errors = changePasswordResult.Errors.ToArray(error => new InputError(error.Description));
            HttpContext.SetStatusMessage("Error: Failed to change the password.");
            return false;
        }

        await _signInManager.RefreshSignInAsync(CurrentUser);
        Logger.LogInformation("User changed their password successfully.");
        HttpContext.SetStatusMessage("Your password has been changed.");
        NavigationManager.Reload();
        return true;
    }
}