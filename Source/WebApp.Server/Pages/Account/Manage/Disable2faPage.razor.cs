namespace VttTools.WebApp.Server.Pages.Account.Manage;

// ReSharper disable once InconsistentNaming
public partial class Disable2faPage {
    private User _user = null!;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<Disable2faPage> Logger { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync();
        if (result.IsFailure)
            return;
        _user = result.Value;
        if (HttpMethods.IsGet(HttpContext.Request.Method) && !await UserManager.GetTwoFactorEnabledAsync(_user))
            throw new InvalidOperationException("Cannot disable 2FA for user as it's not currently enabled.");
    }

    private async Task OnSubmitAsync() {
        var disable2FaResult = await UserManager.SetTwoFactorEnabledAsync(_user, false);
        if (!disable2FaResult.Succeeded)
            throw new InvalidOperationException("Unexpected error occurred disabling 2FA.");

        var userId = await UserManager.GetUserIdAsync(_user);
        Logger.LogInformation("CurrentUser with ID '{UserId}' has disabled 2fa.", userId);
        HttpContext.SetStatusMessage("2fa has been disabled. You can reenable 2fa when you setup an authenticator app");
        NavigationManager.RedirectTo("account/manage/2fa");
    }
}