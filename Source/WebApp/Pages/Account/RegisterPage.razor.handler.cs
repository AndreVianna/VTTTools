namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandler {
    private UserManager<User> _userManager = null!;
    private IUserStore<User> _userStore = null!;
    private SignInManager<User> _signInManager = null!;
    private NavigationManager _navigationManager = null!;
    private IEmailSender<User> _emailSender = null!;
    private ILogger<RegisterPage> _logger = null!;

    internal RegisterPageState State { get; } = new();

    public async Task InitializeAsync(
        UserManager<User> userManager,
        IUserStore<User> userStore,
        SignInManager<User> signInManager,
        NavigationManager navigationManager,
        IEmailSender<User> emailSender,
        ILogger<RegisterPage> logger) {
        _userManager = userManager;
        _userStore = userStore;
        _signInManager = signInManager;
        _navigationManager = navigationManager;
        _emailSender = emailSender;
        _logger = logger;

        var externalLogins = await _signInManager.GetExternalAuthenticationSchemesAsync();
        State.HasExternalLoginProviders = externalLogins.Any();
    }

    public async Task<bool> RegisterUserAsync(string? returnUrl) {
        var user = CreateUser();

        user.Name = State.Input.Name;
        await _userStore.SetUserNameAsync(user, State.Input.Email, CancellationToken.None);
        var emailStore = GetEmailStore();
        await emailStore.SetEmailAsync(user, State.Input.Email, CancellationToken.None);
        var result = await _userManager.CreateAsync(user, State.Input.Password);

        if (!result.Succeeded) {
            State.IdentityErrors = result.Errors;
            return false;
        }

        _logger.LogInformation("User created a new account with password.");

        var userId = await _userManager.GetUserIdAsync(user);
        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = _navigationManager.GetUriWithQueryParameters(
            _navigationManager.ToAbsoluteUri("account/confirm_email").AbsoluteUri,
            new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code, ["returnUrl"] = returnUrl });

        await _emailSender.SendConfirmationLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        if (_userManager.Options.SignIn.RequireConfirmedAccount) {
            var queryParameters = new Dictionary<string, object?> {
                ["email"] = State.Input.Email,
                ["returnUrl"] = returnUrl
            };
            _navigationManager.RedirectTo("account/register_confirmation", queryParameters);
        }
        else {
            await _signInManager.SignInAsync(user, isPersistent: false);
            _navigationManager.RedirectTo(returnUrl);
        }

        return true;
    }

    private static User CreateUser() {
        try {
            return Activator.CreateInstance<User>();
        }
        catch {
            throw new InvalidOperationException($"Can't create an instance of '{nameof(User)}'. " +
                                              $"Ensure that '{nameof(User)}' is not an abstract class and has a parameterless constructor.");
        }
    }

    private IUserEmailStore<User> GetEmailStore() => !_userManager.SupportsUserEmail
        ? throw new NotSupportedException("The default UI requires a user store with email support.")
        : (IUserEmailStore<User>)_userStore;
}