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
        if (user is null || !await _userManager.IsEmailConfirmedAsync(user)) {
            // Don't reveal that the user does not exist or is not confirmed
            _navigationManager.RedirectTo("account/forgot_password_confirmation");
            return;
        }

        // For more information on how to enable account confirmation and password reset please
        // visit https://go.microsoft.com/fwlink/?LinkID=532713
        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = _navigationManager.GetUriWithQueryParameters(
            _navigationManager.ToAbsoluteUri("account/reset_password").AbsoluteUri,
            new Dictionary<string, object?> { ["code"] = code });

        await _emailSender.SendPasswordResetLinkAsync(user, State.Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        _navigationManager.RedirectTo("account/forgot_password_confirmation");
    }
}