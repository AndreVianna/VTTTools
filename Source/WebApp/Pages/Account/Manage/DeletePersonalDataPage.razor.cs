namespace VttTools.WebApp.Pages.Account.Manage;

public partial class DeletePersonalDataPage {
    private string? _message;
    private User _user = null!;
    private bool _requirePassword;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<DeletePersonalDataPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync();
        if (result.IsFailure) return;
        _user = result.Value;
        _requirePassword = await UserManager.HasPasswordAsync(_user);
    }

    private async Task OnValidSubmitAsync() {
        if (_requirePassword && !await UserManager.CheckPasswordAsync(_user, Input.Password)) {
            _message = "Error: Incorrect password.";
            return;
        }

        var result = await UserManager.DeleteAsync(_user);
        if (!result.Succeeded)
            throw new InvalidOperationException("Unexpected error occurred deleting user.");

        await SignInManager.SignOutAsync();

        var userId = await UserManager.GetUserIdAsync(_user);
        Logger.LogInformation("CurrentUser with ID '{UserId}' deleted themselves.", userId);

        NavigationManager.Reload();
    }

    private sealed class InputModel {
        [DataType(DataType.Password)]
        public string Password { get; set; } = "";
    }
}