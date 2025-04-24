namespace VttTools.WebApp.Components.Account.Pages;

public partial class ResendEmailConfirmation {
    private string? _message;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    private async Task OnValidSubmitAsync() {
        var user = await UserManager.FindByEmailAsync(Input.Email!);
        if (user is null) {
            _message = "Verification email sent. Please check your email.";
            return;
        }

        var userId = await UserManager.GetUserIdAsync(user);
        var code = await UserManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("Account/ConfirmEmail").AbsoluteUri,
                                                                      new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code });
        await EmailSender.SendConfirmationLinkAsync(user, Input.Email, HtmlEncoder.Default.Encode(callbackUrl));

        _message = "Verification email sent. Please check your email.";
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";
    }
}