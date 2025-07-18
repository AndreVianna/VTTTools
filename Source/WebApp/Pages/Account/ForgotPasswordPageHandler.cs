namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageHandler(ForgotPasswordPage page)
    : PageHandler<ForgotPasswordPageHandler, ForgotPasswordPage>(page) {
    public async Task RequestPasswordResetAsync() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var user = await userManager.FindByEmailAsync(Page.State.Input.Email);
        if (user is not null && await userManager.IsEmailConfirmedAsync(user))
            await SendConfirmationEmail(user);
        Page.RedirectTo("account/forgot_password_confirmation");
    }

    private async Task SendConfirmationEmail(User user) {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var code = await userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = Page.NavigationManager.GetAbsoluteUrl("account/reset_password", ps => ps.Add("code", code));
        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendPasswordResetLinkAsync(user, Page.State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));
    }
}