using Microsoft.AspNetCore.Http.Features;

namespace WebApp.Components.Account.Pages.Manage;

public partial class TwoFactorAuthentication {
    private bool _canTrack;
    private bool _hasAuthenticator;
    private int _recoveryCodesLeft;
    private bool _is2FaEnabled;
    private bool _isMachineRemembered;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = default!;

    protected override async Task OnInitializedAsync() {
        var user = await UserAccessor.GetRequiredUserAsync(HttpContext);
        _canTrack = HttpContext.Features.Get<ITrackingConsentFeature>()
                             ?.CanTrack
                ?? true;
        _hasAuthenticator = await UserManager.GetAuthenticatorKeyAsync(user) is not null;
        _is2FaEnabled = await UserManager.GetTwoFactorEnabledAsync(user);
        _isMachineRemembered = await SignInManager.IsTwoFactorClientRememberedAsync(user);
        _recoveryCodesLeft = await UserManager.CountRecoveryCodesAsync(user);
    }

    private async Task OnSubmitForgetBrowserAsync() {
        await SignInManager.ForgetTwoFactorClientAsync();

        RedirectManager
           .RedirectToCurrentPageWithStatus("The current browser has been forgotten. When you login again from this browser you will be prompted for your 2fa code.",
                                            HttpContext);
    }
}
