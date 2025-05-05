namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EnableAuthenticatorPage {
    private static readonly CompositeFormat _authenticatorUriFormat = CompositeFormat.Parse("otpauth://totp/{0}:{1}?secret={2}&issuer={0}&digits=6");
    private string? _message;
    private User _user = null!;
    private string? _sharedKey;
    private string? _authenticatorUri;
    private IEnumerable<string>? _recoveryCodes;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private UrlEncoder UrlEncoder { get; set; } = null!;
    [Inject]
    private ILogger<EnableAuthenticatorPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync();
        if (result.IsFailure)
            return;
        _user = result.Value;
        await LoadSharedKeyAndQrCodeUriAsync(_user);
    }

    private async Task OnValidSubmitAsync() {
        // Strip spaces and hyphens
        var verificationCode = Input.Code.Replace(" ", string.Empty).Replace("-", string.Empty);

        var is2FaTokenValid = await UserManager.VerifyTwoFactorTokenAsync(
                                                                          _user, UserManager.Options.Tokens.AuthenticatorTokenProvider, verificationCode);

        if (!is2FaTokenValid) {
            _message = "Error: Verification code is invalid.";
            return;
        }

        await UserManager.SetTwoFactorEnabledAsync(_user, true);
        var userId = await UserManager.GetUserIdAsync(_user);
        Logger.LogInformation("User with ID '{UserId}' has enabled 2FA with an authenticator app.", userId);

        _message = "Your authenticator app has been verified.";

        if (await UserManager.CountRecoveryCodesAsync(_user) == 0) {
            _recoveryCodes = await UserManager.GenerateNewTwoFactorRecoveryCodesAsync(_user, 10);
            return;
        }

        HttpContext.SetStatusMessage(_message);
        NavigationManager.RedirectTo("account/manage/2fa");
    }

    private async ValueTask LoadSharedKeyAndQrCodeUriAsync(User user) {
        // Load the authenticator key & QR code URI to display on the form
        var unformattedKey = await UserManager.GetAuthenticatorKeyAsync(user);
        if (string.IsNullOrEmpty(unformattedKey)) {
            await UserManager.ResetAuthenticatorKeyAsync(user);
            unformattedKey = await UserManager.GetAuthenticatorKeyAsync(user);
        }

        _sharedKey = FormatKey(unformattedKey!);

        var email = await UserManager.GetEmailAsync(user);
        _authenticatorUri = GenerateQrCodeUri(email!, unformattedKey!);
    }

    private static string FormatKey(string unformattedKey) {
        var result = new StringBuilder();
        var currentPosition = 0;
        while (currentPosition + 4 < unformattedKey.Length) {
            result.Append(unformattedKey.AsSpan(currentPosition, 4)).Append(' ');
            currentPosition += 4;
        }
        if (currentPosition < unformattedKey.Length)
            result.Append(unformattedKey.AsSpan(currentPosition));

        return result.ToString().ToLowerInvariant();
    }

    private string GenerateQrCodeUri(string email, string unformattedKey) => string.Format(
                             CultureInfo.InvariantCulture,
                             _authenticatorUriFormat,
                             UrlEncoder.Encode("Microsoft.AspNetCore.Identity.UI"),
                             UrlEncoder.Encode(email),
                             unformattedKey);

    private sealed class InputModel {
        [Required]
        [StringLength(7, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Text)]
        [Display(Name = "Verification Code")]
        public string Code { get; set; } = "";
    }
}