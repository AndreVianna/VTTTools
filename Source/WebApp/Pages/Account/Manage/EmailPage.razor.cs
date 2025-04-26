namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EmailPage {
    private string? _message;
    private User _user = null!;
    private string? _email;
    private bool _isEmailConfirmed;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;
    [Inject]
    private ILogger<EmailPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm(FormName = "change-email")]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        _user = result.Value;
        _email = await UserManager.GetEmailAsync(_user);
        _isEmailConfirmed = await UserManager.IsEmailConfirmedAsync(_user);

        Input.NewEmail ??= _email;
    }

    private async Task OnValidSubmitAsync() {
        if (Input.NewEmail is null || Input.NewEmail == _email) {
            _message = "Your email is unchanged.";
            return;
        }

        var userId = await UserManager.GetUserIdAsync(_user);
        var code = await UserManager.GenerateChangeEmailTokenAsync(_user, Input.NewEmail);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("account/confirm_email_change").AbsoluteUri,
                                                                      new Dictionary<string, object?> { ["userId"] = userId, ["email"] = Input.NewEmail, ["code"] = code });

        await EmailSender.SendConfirmationLinkAsync(_user, Input.NewEmail, HtmlEncoder.Default.Encode(callbackUrl));

        _message = "Confirmation link to change email sent. Please check your email.";
    }

    private async Task OnSendEmailVerificationAsync() {
        if (_email is null)
            return;

        var userId = await UserManager.GetUserIdAsync(_user);
        var code = await UserManager.GenerateEmailConfirmationTokenAsync(_user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = NavigationManager.GetUriWithQueryParameters(NavigationManager.ToAbsoluteUri("account/confirm_email").AbsoluteUri,
                                                                      new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code });

        await EmailSender.SendConfirmationLinkAsync(_user, _email, HtmlEncoder.Default.Encode(callbackUrl));

        Logger.LogInformation("Verification email sent to user with ID {UserId}", userId);
        _message = "Verification email sent. Please check your email.";
    }

    private sealed class InputModel {
        [Required]
        [EmailAddress]
        [Display(Name = "New email")]
        public string? NewEmail { get; set; }
    }
}