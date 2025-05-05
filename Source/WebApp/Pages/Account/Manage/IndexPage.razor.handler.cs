namespace VttTools.WebApp.Pages.Account.Manage;

public class IndexPageHandler(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : AuthorizedComponentHandler<IndexPageHandler, IndexPage>(httpContext, navigationManager, currentUser, loggerFactory) {
    private UserManager<User> _userManager = null!;

    internal IndexPageState State { get; } = new();

    public void Configure(UserManager<User> userManager) {
        _userManager = userManager;
        State.Input.DisplayName = CurrentUser.DisplayName;
    }

    public async Task UpdateProfileAsync() {
        var message = "No changes were made to your profile.";
        var hasUpdates = false;
        if (State.Input.DisplayName != CurrentUser.DisplayName) {
            CurrentUser.DisplayName = State.Input.DisplayName;
            hasUpdates = true;
        }

        if (hasUpdates) {
            message = await TryUpdateUser()
                          ? "Your profile has been updated."
                          : "Error: Failed to update user profile.";
        }

        HttpContext.SetStatusMessage(message);
        NavigationManager.Reload();
    }

    private async Task<bool> TryUpdateUser()
    {
        var updateResult = await _userManager.UpdateAsync(CurrentUser);
        if (!updateResult.Succeeded) {
            Logger.LogWarning("Failed to update the display name for the user with ID {UserId}.", CurrentUser.Id);
            return false;
        }

        Logger.LogInformation("The profile of user with ID {UserId} was updated.", CurrentUser.Id);
        return true;
    }
}