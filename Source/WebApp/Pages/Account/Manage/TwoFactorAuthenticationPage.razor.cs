﻿namespace VttTools.WebApp.Pages.Account.Manage;

public partial class TwoFactorAuthenticationPage {
    private bool _canTrack;
    private bool _hasAuthenticator;
    private int _recoveryCodesLeft;
    private bool _is2FaEnabled;
    private bool _isMachineRemembered;

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

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync();
        if (result.IsFailure)
            return;
        _canTrack = HttpContext.Features.Get<ITrackingConsentFeature>()?.CanTrack ?? true;
        _hasAuthenticator = await UserManager.GetAuthenticatorKeyAsync(result.Value) is not null;
        _is2FaEnabled = await UserManager.GetTwoFactorEnabledAsync(result.Value);
        _isMachineRemembered = await SignInManager.IsTwoFactorClientRememberedAsync(result.Value);
        _recoveryCodesLeft = await UserManager.CountRecoveryCodesAsync(result.Value);
    }

    private async Task OnSubmitForgetBrowserAsync() {
        await SignInManager.ForgetTwoFactorClientAsync();

        HttpContext.SetStatusMessage("The current browser has been forgotten. When you login again from this browser you will be prompted for your 2fa code.");
        NavigationManager.Reload();
    }
}