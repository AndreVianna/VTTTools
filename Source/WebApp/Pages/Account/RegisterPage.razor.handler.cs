namespace VttTools.WebApp.Pages.Account;

public class RegisterPageHandler(RegisterPage page)
    : PublicPageHandler<RegisterPageHandler, RegisterPage>(page) {
    public override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        var signInManager = Page.HttpContext.RequestServices.GetRequiredService<SignInManager<User>>();
        var externalLogins = await signInManager.GetExternalAuthenticationSchemesAsync();
        Page.State.HasExternalLoginProviders = externalLogins.Any();
        return true;
    }

    public async Task<bool> RegisterUserAsync(string? returnUrl) {
        var user = CreateUser();
        user.Name = Page.State.Input.Name;
        user.UserName = Page.State.Input.Email;
        user.NormalizedUserName = Page.State.Input.Email.ToUpperInvariant();
        user.Email = Page.State.Input.Email;
        user.NormalizedEmail = Page.State.Input.Email.ToUpperInvariant();
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var result = await userManager.CreateAsync(user, Page.State.Input.Password);
        if (!result.Succeeded) {
            Page.State.IdentityErrors = result.Errors;
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
        await emailSender.SendConfirmationLinkAsync(user, Page.State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        if (userManager.Options.SignIn.RequireConfirmedAccount) {
            Page.RedirectTo("account/register_confirmation", ps => {
                ps.Add("email", Page.State.Input.Email);
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