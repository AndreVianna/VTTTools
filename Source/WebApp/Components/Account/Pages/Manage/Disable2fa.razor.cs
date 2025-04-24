using VttTools.WebApp.Utilities;

namespace VttTools.WebApp.Components.Account.Pages.Manage;

// ReSharper disable once InconsistentNaming
public partial class Disable2fa {
    private User _user = null!;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private IdentityRedirectManager RedirectManager { get; set; } = null!;
    [Inject]
    private IdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<Disable2fa> Logger { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetRequiredUserOrRedirectAsync(HttpContext, UserManager);
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
        Logger.LogInformation("User with ID '{UserId}' has disabled 2fa.", userId);
        RedirectManager.RedirectToWithStatus("Account/Manage/TwoFactorAuthentication",
                                             "2fa has been disabled. You can reenable 2fa when you setup an authenticator app",
                                             HttpContext);
    }
}