namespace VttTools.WebApp.Pages.Account;

public partial class ExternalLoginPage {
    public const string LoginCallbackAction = "LoginCallback";
    private string? _message;
    private ExternalLoginInfo? _externalLoginInfo;

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
    private IEmailSender<User> EmailSender { get; set; } = null!;
    [Inject]
    private ILogger<ExternalLoginPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    [SupplyParameterFromQuery]
    private string? RemoteError { get; set; }

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    [SupplyParameterFromQuery]
    private string? Action { get; set; }

    private string? ProviderDisplayName => _externalLoginInfo?.ProviderDisplayName;

    protected override async Task OnInitializedAsync() {
        if (RemoteError is not null) {
            HttpContext.SetStatusMessage($"Error from external provider: {RemoteError}");
            NavigationManager.GoToSignIn();
        }

        var info = await SignInManager.GetExternalLoginInfoAsync();
        if (info is null) {
            HttpContext.SetStatusMessage("Error loading external login information.");
            NavigationManager.GoToSignIn();
        }

        _externalLoginInfo = info;

        if (HttpMethods.IsGet(HttpContext.Request.Method)) {
            if (Action == LoginCallbackAction) {
                await OnLoginCallbackAsync();
                return;
            }

            // We should only reach this page via the login callback, so redirect back to
            // the login page if we get here some other way.
            NavigationManager.GoToSignIn();
        }
    }

    private async Task OnLoginCallbackAsync() {
        if (_externalLoginInfo is null) {
            HttpContext.SetStatusMessage("Error loading external login information.");
            NavigationManager.GoToSignIn();
            return;
        }

        var result = await SignInManager.ExternalLoginSignInAsync(_externalLoginInfo.LoginProvider,
                                                                  _externalLoginInfo.ProviderKey,
                                                                  isPersistent: false,
                                                                  bypassTwoFactor: true);

        if (result.Succeeded) {
            Logger.LogInformation("{Title} logged in with {LoginProvider} provider.",
                                  _externalLoginInfo.Principal.Identity?.Name,
                                  _externalLoginInfo.LoginProvider);
            NavigationManager.RedirectTo(ReturnUrl);
            return;
        }

        if (result.IsLockedOut) {
            NavigationManager.GoToSignIn();
            return;
        }

        // If the user does not have an account, then ask the user to create an account.
        if (_externalLoginInfo.Principal.HasClaim(c => c.Type == ClaimTypes.Email))
            Input.Email = _externalLoginInfo.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
    }

    private async Task OnValidSubmitAsync() {
        if (_externalLoginInfo is null) {
            HttpContext.SetStatusMessage("Error loading external login information during confirmation.");
            NavigationManager.GoToSignIn();
            return;
        }

        var emailStore = GetEmailStore();
        var user = CreateUser();

        await UserStore.SetUserNameAsync(user, Input.Email, CancellationToken.None);
        await emailStore.SetEmailAsync(user, Input.Email, CancellationToken.None);

        var result = await UserManager.CreateAsync(user);
        if (result.Succeeded) {
            result = await UserManager.AddLoginAsync(user, _externalLoginInfo);
            if (result.Succeeded) {
                Logger.LogInformation("CurrentUser created an account using {Title} provider.", _externalLoginInfo.LoginProvider);

                var userId = await UserManager.GetUserIdAsync(user);
                var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("account/confirm_email").AbsoluteUri,
                                                                              new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code });
                await EmailSender.SendConfirmationLinkAsync(user, Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

                // If account confirmation is required, we need to show the link if we don't have a real email sender
                if (UserManager.Options.SignIn.RequireConfirmedAccount)
                    NavigationManager.RedirectTo("account/register_confirmation", ps => ps.Add("email", Input.Email));

                await SignInManager.SignInAsync(user, isPersistent: false, _externalLoginInfo.LoginProvider);
                NavigationManager.RedirectTo(ReturnUrl);
            }
        }

        _message = $"Error: {string.Join(",", result.Errors.Select(error => error.Description))}";
    }

    private static User CreateUser() {
        try {
            return Activator.CreateInstance<User>();
        }
        catch {
            throw new InvalidOperationException($"Can't create an instance of '{nameof(User)}'. " +
                                                $"Ensure that '{nameof(User)}' is not an abstract class and has a parameterless constructor");
        }
    }

    private IUserEmailStore<User> GetEmailStore() => !UserManager.SupportsUserEmail
            ? throw new NotSupportedException("The default UI requires a user store with email support.")
            : (IUserEmailStore<User>)UserStore;

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
    }
}