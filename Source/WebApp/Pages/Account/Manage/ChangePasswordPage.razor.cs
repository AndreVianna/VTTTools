namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    private string? _message;
    private User _user = null!;
    private bool _hasPassword;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [Inject]
    private UserManager<User> UserManager { get; set; } = null!;
    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IIdentityUserAccessor UserAccessor { get; set; } = null!;
    [Inject]
    private ILogger<ChangePasswordPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        _user = result.Value;
        _hasPassword = await UserManager.HasPasswordAsync(_user);
        if (!_hasPassword)
            NavigationManager.RedirectTo("account/manage/set_password");
    }

    private async Task OnValidSubmitAsync() {
        var changePasswordResult = await UserManager.ChangePasswordAsync(_user, Input.OldPassword, Input.NewPassword);
        if (!changePasswordResult.Succeeded) {
            _message = $"Error: {string.Join(",", changePasswordResult.Errors.Select(error => error.Description))}";
            return;
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("User changed their password successfully.");

        NavigationManager.ReloadPageWithStatus("Your password has been changed", HttpContext);
    }

    private sealed class InputModel {
        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Current password")]
        public string OldPassword { get; set; } = "";

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; } = "";

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; } = "";
    }
}