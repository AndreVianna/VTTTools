namespace VttTools.WebApp.Components.Account.Pages.Manage;

public partial class ResetAuthenticator {
    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IdentityRedirectManager RedirectManager { get; set; } = null!;
    [Inject]
    private IdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ResetAuthenticator> Logger { get; set; } = null!;

    private async Task OnSubmitAsync() {
        var result = await UserAccessor.GetRequiredUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        await UserManager.SetTwoFactorEnabledAsync(result.Value, false);
        await UserManager.ResetAuthenticatorKeyAsync(result.Value);
        var userId = await UserManager.GetUserIdAsync(result.Value);
        Logger.LogInformation("User with ID '{UserId}' has reset their authentication app key.", userId);
        await SignInManager.RefreshSignInAsync(result.Value);
        RedirectManager.RedirectToWithStatus("Account/Manage/EnableAuthenticator",
                                             "Your authenticator app key has been reset, you will need to configure your authenticator app using the new key.",
                                             HttpContext);
    }
}