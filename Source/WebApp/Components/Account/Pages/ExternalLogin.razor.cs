using HttpServices.Model;

namespace WebApp.Components.Account.Pages;

public partial class ExternalLogin {
    public const string LoginCallbackAction = "LoginCallback";
    private string? _message;
    private ExternalLoginInfo? _externalLoginInfo;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

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
        if (RemoteError is not null)
            RedirectManager.RedirectToWithStatus("Account/Login", $"Error from external provider: {RemoteError}", HttpContext);

        var info = await SignInManager.GetExternalLoginInfoAsync();
        if (info is null)
            RedirectManager.RedirectToWithStatus("Account/Login", "Error loading external login information.", HttpContext);

        _externalLoginInfo = info;

        if (HttpMethods.IsGet(HttpContext.Request.Method)) {
            if (Action == LoginCallbackAction) {
                await OnLoginCallbackAsync();
                return;
            }

            // We should only reach this page via the login callback, so redirect back to
            // the login page if we get here some other way.
            RedirectManager.RedirectTo("Account/Login");
        }
    }

    private async Task OnLoginCallbackAsync() {
        if (_externalLoginInfo is null)
            RedirectManager.RedirectToWithStatus("Account/Login", "Error loading external login information.", HttpContext);

        // Sign in the user with this external login provider if the user already has a login.
        var result = await SignInManager.ExternalLoginSignInAsync(_externalLoginInfo.LoginProvider,
                                                                  _externalLoginInfo.ProviderKey,
                                                                  isPersistent: false,
                                                                  bypassTwoFactor: true);

        if (result.Succeeded) {
            Logger.LogInformation("{Name} logged in with {LoginProvider} provider.",
                                  _externalLoginInfo.Principal.Identity?.Name,
                                  _externalLoginInfo.LoginProvider);
            RedirectManager.RedirectTo(ReturnUrl);
        }
        else if (result.IsLockedOut) {
            Logger.LogInformation("{Name} locked out.",
                                  _externalLoginInfo.Principal.Identity?.Name);
            RedirectManager.RedirectTo("Account/Lockout");
        }

        // If the user does not have an account, then ask the user to create an account.
        if (_externalLoginInfo.Principal.HasClaim(c => c.Type == ClaimTypes.Email))
            Input.Email = _externalLoginInfo.Principal.FindFirstValue(ClaimTypes.Email) ?? "";
    }

    private async Task OnValidSubmitAsync() {
        if (_externalLoginInfo is null)
            RedirectManager.RedirectToWithStatus("Account/Login", "Error loading external login information during confirmation.", HttpContext);

        var emailStore = GetEmailStore();
        var user = CreateUser();

        await UserStore.SetUserNameAsync(user, Input.Email, CancellationToken.None);
        await emailStore.SetEmailAsync(user, Input.Email, CancellationToken.None);

        var result = await UserManager.CreateAsync(user);
        if (result.Succeeded) {
            result = await UserManager.AddLoginAsync(user, _externalLoginInfo);
            if (result.Succeeded) {
                Logger.LogInformation("User created an account using {Name} provider.", _externalLoginInfo.LoginProvider);

                var userId = await UserManager.GetUserIdAsync(user);
                var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("Account/ConfirmEmail")
                                                                                               .AbsoluteUri,
                                                                              new Dictionary<string, object?> {
                                                                                  ["userId"] = userId,
                                                                                  ["code"] = code
                                                                              });
                await EmailSender.SendConfirmationLinkAsync(user, Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

                // If account confirmation is required, we need to show the link if we don't have a real email sender
                if (UserManager.Options.SignIn.RequireConfirmedAccount)
                    RedirectManager.RedirectTo("Account/RegisterConfirmation", new() { ["email"] = Input.Email });

                await SignInManager.SignInAsync(user, isPersistent: false, _externalLoginInfo.LoginProvider);
                RedirectManager.RedirectTo(ReturnUrl);
            }
        }

        _message = $"Error: {string.Join(",", result.Errors.Select(error => error.Description))}";
    }

    private User CreateUser() {
        try {
            return Activator.CreateInstance<User>();
        }
        catch {
            throw new InvalidOperationException($"Can't create an instance of '{nameof(User)}'. "
                                              + $"Ensure that '{nameof(User)}' is not an abstract class and has a parameterless constructor");
        }
    }

    private IUserEmailStore<User> GetEmailStore()
        => !UserManager.SupportsUserEmail
               ? throw new NotSupportedException("The default UI requires a user store with email support.")
               : (IUserEmailStore<User>)UserStore;

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
    }
}
