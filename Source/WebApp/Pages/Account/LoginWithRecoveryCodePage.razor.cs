namespace VttTools.WebApp.Pages.Account;

public partial class LoginWithRecoveryCodePage {
    private string? _message;
    private User _user = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private ILogger<LoginWithRecoveryCodePage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    protected override async Task OnInitializedAsync()
        // Ensure the user has gone through the username & password screen first
        => _user = await SignInManager.GetTwoFactorAuthenticationUserAsync()
                ?? throw new InvalidOperationException("Unable to load two-factor authentication user.");

    private async Task OnValidSubmitAsync() {
        var recoveryCode = Input.Code.Replace(" ", string.Empty);

        var result = await SignInManager.TwoFactorRecoveryCodeSignInAsync(recoveryCode);

        var userId = await UserManager.GetUserIdAsync(_user);

        if (result.Succeeded) {
            Logger.LogInformation("CurrentUser with ID '{UserId}' logged in with a recovery code.", userId);
            NavigationManager.RedirectTo(ReturnUrl);
        }
        else if (result.IsLockedOut) {
            Logger.LogWarning("CurrentUser account locked out.");
            NavigationManager.RedirectTo("account/lockout");
        }
        else {
            Logger.LogWarning("Invalid recovery code entered for user with ID '{UserId}' ", userId);
            _message = "Error: Invalid recovery code entered.";
        }
    }

    private sealed class InputModel {
        [Required]
        [DataType(DataType.Text)]
        [Display(Name = "Recovery Code")]
        public string Code { get; set; } = "";
    }
}