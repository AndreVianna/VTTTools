namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandler {
    private UserManager<User> _userManager = null!;
    private SignInManager<User> _signInManager = null!;
    private NavigationManager _navigationManager = null!;
    private ILogger<LoginPage> _logger = null!;
    private HttpContext _httpContext = null!;

    internal LoginPageState State { get; } = new();

    public async Task InitializeAsync(
        HttpContext httpContext,
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        NavigationManager navigationManager,
        ILogger<LoginPage> logger) {
        _httpContext = httpContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _navigationManager = navigationManager;
        _logger = logger;

        if (HttpMethods.IsGet(httpContext.Request.Method)) {
            await httpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            var externalLogins = await signInManager.GetExternalAuthenticationSchemesAsync();
            State.HasExternalLoginProviders = externalLogins.Any();
        }
    }

    public async Task<bool> LoginUserAsync(string? returnUrl) {
        var result = await _signInManager.PasswordSignInAsync(
            State.Input.Email,
            State.Input.Password,
            State.Input.RememberMe,
            lockoutOnFailure: true);

        if (result.Succeeded) {
            var user = await _userManager.FindByEmailAsync(State.Input.Email);
            var principal = await _signInManager.ClaimsFactory.CreateAsync(user!);
            await _httpContext.SignInAsync(IdentityConstants.ExternalScheme, principal);
            _logger.LogInformation("User logged in.");
            _navigationManager.RedirectTo(returnUrl);
            return true;
        }

        if (result.RequiresTwoFactor) {
            var queryParameters = new Dictionary<string, object?> {
                ["returnUrl"] = returnUrl,
                ["rememberMe"] = State.Input.RememberMe,
            };
            _navigationManager.RedirectTo("account/login_with_2fa", queryParameters);
            return true;
        }

        if (result.IsLockedOut) {
            _logger.LogWarning("User account locked out.");
            _navigationManager.RedirectTo("account/lockout");
            return true;
        }

        State.ErrorMessage = "Error: Invalid login attempt.";
        return false;
    }
}