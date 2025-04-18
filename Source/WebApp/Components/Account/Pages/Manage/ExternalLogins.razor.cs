namespace WebApp.Components.Account.Pages.Manage;

public partial class ExternalLogins {
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
    private IdentityRedirectManager RedirectManager { get; set; } = null!;
    [Inject]
    private IdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ExternalLogins> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private string? LoginProvider { get; set; }

    [SupplyParameterFromForm]
    private string? ProviderKey { get; set; }

    [SupplyParameterFromQuery]
    private string? Action { get; set; }

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetRequiredUserOrRedirectAsync(HttpContext, UserManager);
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
            RedirectManager.RedirectToCurrentPageWithStatus("Error: The external login was not removed.", HttpContext);
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("The {LoginProvider} external login was removed for user with ID {UserId}.", LoginProvider, _user.Id);
        RedirectManager.RedirectToCurrentPageWithStatus("The external login was removed.", HttpContext);
    }

    private async Task OnGetLinkLoginCallbackAsync() {
        var userId = await UserManager.GetUserIdAsync(_user);
        var info = await SignInManager.GetExternalLoginInfoAsync(userId);
        if (info is null) {
            Logger.LogWarning("The {LoginProvider} external login was not found.", LoginProvider);
            RedirectManager.RedirectToCurrentPageWithStatus("Error: Could not load external login info.", HttpContext);
        }

        var result = await UserManager.AddLoginAsync(_user, info);
        if (!result.Succeeded) {
            Logger.LogWarning("Failed to add the {LoginProvider} external login for user with ID {UserId}.", LoginProvider, _user.Id);
            RedirectManager.RedirectToCurrentPageWithStatus("Error: The external login was not added. External logins can only be associated with one account.", HttpContext);
        }

        // Clear the existing external cookie to ensure a clean login process
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        Logger.LogInformation("The {LoginProvider} external login was add for user with ID {UserId}.", LoginProvider, _user.Id);
        RedirectManager.RedirectToCurrentPageWithStatus("The external login was added.", HttpContext);
    }
}
