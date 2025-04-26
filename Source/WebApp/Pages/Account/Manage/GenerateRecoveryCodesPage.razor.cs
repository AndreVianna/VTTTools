namespace VttTools.WebApp.Pages.Account.Manage;

public partial class GenerateRecoveryCodesPage {
    private string? _message;
    private User _user = null!;
    private IEnumerable<string>? _recoveryCodes;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<GenerateRecoveryCodesPage> Logger { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        _user = result.Value;

        var isTwoFactorEnabled = await UserManager.GetTwoFactorEnabledAsync(_user);
        if (!isTwoFactorEnabled)
            throw new InvalidOperationException("Cannot generate recovery codes for user because they do not have 2FA enabled.");
    }

    private async Task OnSubmitAsync() {
        var userId = await UserManager.GetUserIdAsync(_user);
        _recoveryCodes = await UserManager.GenerateNewTwoFactorRecoveryCodesAsync(_user, 10);
        _message = "You have generated new recovery codes.";

        Logger.LogInformation("User with ID '{UserId}' has generated new 2FA recovery codes.", userId);
    }
}