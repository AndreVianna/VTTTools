namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandler(ChangePasswordPage page)
    : PageHandler<ChangePasswordPageHandler, ChangePasswordPage>(page) {
    public override bool Configure() {
        if (Page.AccountOwner.HasPassword)
            return true;
        Page.RedirectTo("account/manage/set_password");
        return false;
    }

    public async Task ChangePasswordAsync() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var changePasswordResult = await userManager.ChangePasswordAsync(
            Page.AccountOwner,
            Page.State.Input.CurrentPassword,
            Page.State.Input.NewPassword);

        if (!changePasswordResult.Succeeded) {
            Page.State.Errors = changePasswordResult.Errors.ToArray(error => new InputError(error.Description));
            Page.SetStatusMessage("Error: Failed to change the password.");
            return;
        }

        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        await signInManager.RefreshSignInAsync(Page.AccountOwner);
        Page.Logger.LogInformation("Current user changed the password successfully.");
        Page.SetStatusMessage("Your password has been changed.");
    }
}