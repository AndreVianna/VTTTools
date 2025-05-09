﻿namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ExternalLoginsPage {
    public const string LinkLoginCallbackAction = "LinkLoginCallback";
    private User _user = null!;
    private IList<UserLoginInfo>? _currentLogins;
    private IList<AuthenticationScheme>? _otherLogins;
    private bool _showRemoveButton;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private IUserStore<User> UserStore { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ExternalLoginsPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private string? LoginProvider { get; set; }

    [SupplyParameterFromForm]
    private string? ProviderKey { get; set; }

    [SupplyParameterFromQuery]
    private string? Action { get; set; }

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync();
        if (result.IsFailure)
            return;
        _user = result.Value;
        _currentLogins = await UserManager.GetLoginsAsync(_user);
        var schemes = await SignInManager.GetExternalAuthenticationSchemesAsync();
        _otherLogins = [.. schemes.Where(auth => _currentLogins.All(ul => auth.Name != ul.LoginProvider))];

        string? passwordHash = null;
        if (UserStore is IUserPasswordStore<User> userPasswordStore)
            passwordHash = await userPasswordStore.GetPasswordHashAsync(_user, HttpContext.RequestAborted);

        _showRemoveButton = passwordHash is not null || _currentLogins.Count > 1;

        if (HttpMethods.IsGet(HttpContext.Request.Method) && Action == LinkLoginCallbackAction)
            await OnGetLinkLoginCallbackAsync();
    }

    private async Task OnSubmitAsync() {
        var result = await UserManager.RemoveLoginAsync(_user, LoginProvider!, ProviderKey!);
        if (!result.Succeeded) {
            Logger.LogWarning("Failed to remove the {LoginProvider} external login for user with ID {UserId}.", LoginProvider, _user.Id);
            HttpContext.SetStatusMessage("Error: The external login was not removed.");
            NavigationManager.Reload();
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("The {LoginProvider} external login was removed for user with ID {UserId}.", LoginProvider, _user.Id);
        HttpContext.SetStatusMessage("The external login was removed.");
        NavigationManager.Reload();
    }

    private async Task OnGetLinkLoginCallbackAsync() {
        var userId = await UserManager.GetUserIdAsync(_user);
        var info = await SignInManager.GetExternalLoginInfoAsync(userId);
        if (info is null) {
            Logger.LogWarning("The {LoginProvider} external login was not found.", LoginProvider);
            HttpContext.SetStatusMessage("Error: Could not load external login info.");
            NavigationManager.Reload();
            return;
        }

        var result = await UserManager.AddLoginAsync(_user, info);
        if (!result.Succeeded) {
            Logger.LogWarning("Failed to add the {LoginProvider} external login for user with ID {UserId}.", LoginProvider, _user.Id);
            HttpContext.SetStatusMessage("Error: The external login was not added. External logins can only be associated with one account.");
            NavigationManager.Reload();
            return;
        }

        // Clear the existing external cookie to ensure a clean login process
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        Logger.LogInformation("The {LoginProvider} external login was add for user with ID {UserId}.", LoginProvider, _user.Id);
        HttpContext.SetStatusMessage("The external login was added.");
        NavigationManager.Reload();
    }
}