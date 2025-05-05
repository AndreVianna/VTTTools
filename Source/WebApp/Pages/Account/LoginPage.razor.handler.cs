namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : ComponentHandler<LoginPageHandler, LoginPage>(httpContext, navigationManager, loggerFactory) {
    private UserManager<User> _userManager = null!;
    private SignInManager<User> _signInManager = null!;
    internal LoginPageState State { get; } = new();

    public async Task ConfigureAsync(UserManager<User> userManager,
                                     SignInManager<User> signInManager) {
        _userManager = userManager;
        _signInManager = signInManager;
        if (!HttpMethods.IsGet(HttpContext.Request.Method)) return;
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        var externalLogins = await signInManager.GetExternalAuthenticationSchemesAsync();
        State.HasExternalLoginProviders = externalLogins.Any();
    }
    public async Task<bool> LoginUserAsync(string? returnUrl) {
        State.ErrorMessage = null;
        var result = await _signInManager.PasswordSignInAsync(
            State.Input.Email,
            State.Input.Password,
            State.Input.RememberMe,
            lockoutOnFailure: true);

        if (result.Succeeded) {
            var user = await _userManager.FindByEmailAsync(State.Input.Email);
            var principal = await _signInManager.ClaimsFactory.CreateAsync(user!);
            await HttpContext.SignInAsync(IdentityConstants.ExternalScheme, principal);
            Logger.LogInformation("User logged in.");
            NavigationManager.RedirectTo(returnUrl);
            return true;
        }

        if (result.RequiresTwoFactor) {
            NavigationManager.RedirectTo("account/login_with_2fa", ps => {
                ps.Add("returnUrl", returnUrl);
                ps.Add("rememberMe", State.Input.RememberMe);
            });
            return true;
        }

        if (result.IsLockedOut) {
            Logger.LogWarning("User account locked out.");
            NavigationManager.RedirectTo("account/lockout");
            return true;
        }

        State.ErrorMessage = "Error: Invalid login attempt.";
        return false;
    }
}