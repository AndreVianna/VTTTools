namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : ComponentHandler<RegisterPageHandler, RegisterPage>(httpContext, navigationManager, loggerFactory) {
    private UserManager<User> _userManager = null!;
    private SignInManager<User> _signInManager = null!;
    private IEmailSender<User> _emailSender = null!;

    internal RegisterPageState State { get; } = new();

    public async Task ConfigureAsync(UserManager<User> userManager,
                                      SignInManager<User> signInManager,
                                      IEmailSender<User> emailSender) {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailSender = emailSender;

        var externalLogins = await _signInManager.GetExternalAuthenticationSchemesAsync();
        State.HasExternalLoginProviders = externalLogins.Any();
    }

    public async Task<bool> RegisterUserAsync(string? returnUrl) {
        var user = CreateUser();
        user.Name = State.Input.Name;
        user.UserName = State.Input.Email;
        user.NormalizedUserName = State.Input.Email.ToUpperInvariant();
        user.Email = State.Input.Email;
        user.NormalizedEmail = State.Input.Email.ToUpperInvariant();
        var result = await _userManager.CreateAsync(user, State.Input.Password);

        if (!result.Succeeded) {
            State.IdentityErrors = result.Errors;
            return false;
        }

        Logger.LogInformation("User created a new account with password.");

        var userId = await _userManager.GetUserIdAsync(user);
        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetAbsoluteUrl("account/confirm_email", ps => {
            ps.Add("userId", userId);
            ps.Add("code", code);
            ps.Add("returnUrl", returnUrl);
        });
        await _emailSender.SendConfirmationLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        if (_userManager.Options.SignIn.RequireConfirmedAccount) {
            NavigationManager.RedirectTo("account/register_confirmation", ps => {
                ps.Add("email", State.Input.Email);
                ps.Add("returnUrl", returnUrl);
            });
        }
        else {
            await _signInManager.SignInAsync(user, isPersistent: false);
            NavigationManager.RedirectTo(returnUrl);
        }

        return true;
    }

    private static User CreateUser() {
        try {
            return Activator.CreateInstance<User>();
        }
        catch {
            throw new InvalidOperationException(
                $"Can't create an instance of '{nameof(User)}'. " +
                $"Ensure that '{nameof(User)}' is not an abstract class and has a parameterless constructor.");
        }
    }
}