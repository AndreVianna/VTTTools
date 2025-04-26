namespace VttTools.WebApp.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    private async Task OnValidSubmitAsync() {
        var user = await UserManager.FindByEmailAsync(Input.Email);
        if (user is null || !await UserManager.IsEmailConfirmedAsync(user)) {
            // Don't reveal that the user does not exist or is not confirmed
            NavigationManager.RedirectTo("account/forgot_password_confirmation");
        }

        // For more information on how to enable account confirmation and password reset please
        // visit https://go.microsoft.com/fwlink/?LinkID=532713
        var code = await UserManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("account/reset_password").AbsoluteUri,
                                                                      new Dictionary<string, object?> { ["code"] = code });

        await EmailSender.SendPasswordResetLinkAsync(user, Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        NavigationManager.RedirectTo("account/forgot_password_confirmation");
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
    }
}