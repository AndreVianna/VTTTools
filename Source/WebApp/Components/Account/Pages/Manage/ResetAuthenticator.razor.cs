using VttTools.WebApp.Utilities;

namespace VttTools.WebApp.Components.Account.Pages.Manage;

public partial class ResetAuthenticator {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ResetAuthenticator> Logger { get; set; } = null!;

    private async Task OnSubmitAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        await UserManager.SetTwoFactorEnabledAsync(result.Value, false);
        await UserManager.ResetAuthenticatorKeyAsync(result.Value);
        var userId = await UserManager.GetUserIdAsync(result.Value);
        Logger.LogInformation("User with ID '{UserId}' has reset their authentication app key.", userId);
        await SignInManager.RefreshSignInAsync(result.Value);
        NavigationManager.RedirectToWithStatus("Account/Manage/EnableAuthenticator",
                                             "Your authenticator app key has been reset, you will need to configure your authenticator app using the new key.",
                                             HttpContext);
    }
}