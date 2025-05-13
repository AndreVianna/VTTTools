namespace VttTools.WebApp.Pages.Account.Manage;

public class ProfilePageHandler(ProfilePage page)
    : AccountPageHandler<ProfilePageHandler, ProfilePage>(page) {
    public override bool Configure() {
        if (!base.Configure())
            return false;
        Page.State.Input.DisplayName = Page.CurrentUser.DisplayName;
        return true;
    }

    public async Task UpdateProfileAsync() {
        var message = "No changes were made to your profile.";
        var hasUpdates = false;
        if (Page.State.Input.DisplayName != Page.CurrentUser.DisplayName) {
            Page.CurrentUser.DisplayName = Page.State.Input.DisplayName;
            hasUpdates = true;
        }

        if (hasUpdates) {
            message = await TryUpdateUser()
                          ? "Your profile has been updated."
                          : "Error: Failed to update user profile.";
        }

        Page.SetStatusMessage(message);
        Page.Reload();
    }

    private async Task<bool> TryUpdateUser() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var updateResult = await userManager.UpdateAsync(Page.CurrentUser);
        if (!updateResult.Succeeded) {
            Page.State.Input.Errors = updateResult.Errors.ToArray(e => new InputError(e.Description));
            Page.Logger.LogWarning("Failed to update the display name for the user with ID {UserId}.", Page.CurrentUser.Id);
            return false;
        }

        Page.Logger.LogInformation("The profile of user with ID {UserId} was updated.", Page.CurrentUser.Id);
        return true;
    }
}