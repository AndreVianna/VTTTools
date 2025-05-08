namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandler(IPublicPage page)
    : PublicPageHandler<RegisterPageHandler>(page) {
    internal RegisterPageState State { get; } = new();

    public override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        var externalLogins = await signInManager.GetExternalAuthenticationSchemesAsync();
        State.HasExternalLoginProviders = externalLogins.Any();
        return true;
    }

    public async Task<bool> RegisterUserAsync(string? returnUrl) {
        var user = CreateUser();
        user.Name = State.Input.Name;
        user.UserName = State.Input.Email;
        user.NormalizedUserName = State.Input.Email.ToUpperInvariant();
        user.Email = State.Input.Email;
        user.NormalizedEmail = State.Input.Email.ToUpperInvariant();
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var result = await userManager.CreateAsync(user, State.Input.Password);
        if (!result.Succeeded) {
            State.IdentityErrors = result.Errors;
            return false;
        }

        Page.Logger.LogInformation("CurrentUser created a new account with password.");

        var userId = await userManager.GetUserIdAsync(user);
        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = Page.NavigationManager.GetAbsoluteUrl("account/confirm_email", ps => {
            ps.Add("userId", userId);
            ps.Add("code", code);
            ps.Add("returnUrl", returnUrl);
        });
        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendConfirmationLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        if (userManager.Options.SignIn.RequireConfirmedAccount) {
            Page.RedirectTo("account/register_confirmation", ps => {
                ps.Add("email", State.Input.Email);
                ps.Add("returnUrl", returnUrl);
            });
        }
        else {
            var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
            await signInManager.SignInAsync(user, isPersistent: false);
            Page.RedirectTo(returnUrl);
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