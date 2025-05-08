namespace VttTools.WebApp.Pages.Account;

public class LoginPageHandler(IPublicPage page)
    : PublicPageHandler<LoginPageHandler>(page) {
    internal LoginPageState State { get; } = new();

    public override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        if (!HttpMethods.IsGet(Page.HttpContext.Request.Method)) {
            return false;
        }
        await Page.HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        var externalLogins = await signInManager.GetExternalAuthenticationSchemesAsync();
        State.HasExternalLoginProviders = externalLogins.Any();
        return true;
    }

    internal async Task<bool> LoginUserAsync(LoginInputModel input, string? returnUrl) {
        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        var result = await signInManager.PasswordSignInAsync(
            input.Email,
            input.Password,
            input.RememberMe,
            lockoutOnFailure: true);

        if (result.Succeeded) {
            var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
            var user = await userManager.FindByEmailAsync(input.Email);
            Ensure.IsNotNull(user);
            var principal = await signInManager.ClaimsFactory.CreateAsync(user);
            ((ClaimsIdentity)principal.Identity!).AddClaim(new(ClaimTypes.GivenName, user.DisplayName));
            await Page.HttpContext.SignInAsync(IdentityConstants.ExternalScheme, principal);
            Page.Logger.LogInformation("User {UserId} logged in.", user.Id);
            Page.RedirectTo(returnUrl);
            return true;
        }

        if (result.RequiresTwoFactor) {
            Page.RedirectTo("account/login_with_2fa", ps => {
                ps.Add("returnUrl", returnUrl);
                ps.Add("rememberMe", input.RememberMe);
            });
            return true;
        }

        if (result.IsLockedOut) {
            Page.Logger.LogWarning("User {Email} account locked out.", input.Email);
            Page.RedirectTo("account/lockout");
            return true;
        }

        Page.SetStatusMessage("Error: Invalid login attempt.");
        return false;
    }
}