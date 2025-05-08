namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandler(IAccountPage page)
    : AccountPageHandler<ChangePasswordPageHandler>(page) {
    internal ChangePasswordPageState State { get; } = new();

    public override bool Configure() {
        if (Page.CurrentUser.HasPassword) return true;
        Page.RedirectTo("account/manage/set_password");
        return false;
    }

    public async Task ChangePasswordAsync() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var changePasswordResult = await userManager.ChangePasswordAsync(
            Page.CurrentUser,
            State.Input.CurrentPassword,
            State.Input.NewPassword);

        if (!changePasswordResult.Succeeded) {
            State.Input.Errors = changePasswordResult.Errors.ToArray(error => new InputError(error.Description));
            Page.SetStatusMessage("Error: Failed to change the password.");
            return;
        }

        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        await signInManager.RefreshSignInAsync(Page.CurrentUser);
        Page.Logger.LogInformation("Current user changed the password successfully.");
        Page.SetStatusMessage("Your password has been changed.");
    }
}