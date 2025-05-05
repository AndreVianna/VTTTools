namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageHandler(HttpContext httpContext, NavigationManager navigationManager, ILoggerFactory loggerFactory)
    : ComponentHandler<ForgotPasswordPageHandler, ForgotPasswordPage>(httpContext, navigationManager, loggerFactory) {
    private UserManager<User> _userManager = null!;
    private IEmailSender<User> _emailSender = null!;

    internal ForgotPasswordPageState State { get; } = new();

    public void Configure(UserManager<User> userManager, IEmailSender<User> emailSender) {
        _userManager = userManager;
        _emailSender = emailSender;
    }

    public async Task RequestPasswordResetAsync() {
        var user = await _userManager.FindByEmailAsync(State.Input.Email);
        if (user is not null && await _userManager.IsEmailConfirmedAsync(user))
            await SendConfirmationEmail(user);
        NavigationManager.RedirectTo("account/forgot_password_confirmation");
    }

    private async Task SendConfirmationEmail(User user) {
        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetAbsoluteUrl("account/reset_password", ps => ps.Add("code", code));
        await _emailSender.SendPasswordResetLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));
    }
}