namespace VttTools.WebApp.Pages.Account;

public class ForgotPasswordPageHandler {
    private UserManager<User> _userManager = null!;
    private NavigationManager _navigationManager = null!;
    private IEmailSender<User> _emailSender = null!;

    internal ForgotPasswordPageState State { get; } = new();

    public void Initialize(
        UserManager<User> userManager,
        NavigationManager navigationManager,
        IEmailSender<User> emailSender) {
        _userManager = userManager;
        _navigationManager = navigationManager;
        _emailSender = emailSender;
    }

    public async Task RequestPasswordResetAsync() {
        var user = await _userManager.FindByEmailAsync(State.Input.Email);
        if (user is not null && await _userManager.IsEmailConfirmedAsync(user))
            await SendConfirmationEmail(user);

        _navigationManager.RedirectTo("account/forgot_password_confirmation");
    }

    private async Task SendConfirmationEmail(User user) {
        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = _navigationManager.GetAbsoluteUri("account/reset_password", ps => ps.Add("code", code));
        await _emailSender.SendPasswordResetLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));
    }
}