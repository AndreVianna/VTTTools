using VttTools.WebApp.Utilities;

namespace VttTools.WebApp.Components.Account.Pages.Manage;

public partial class SetPassword {
    private string? _message;
    private User _user = null!;

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
    private ILogger<SetPassword> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        _user = result.Value;
        var hasPassword = await UserManager.HasPasswordAsync(_user);
        if (hasPassword)
            NavigationManager.RedirectTo("Account/Manage/ChangePassword");
    }

    private async Task OnValidSubmitAsync() {
        var addPasswordResult = await UserManager.AddPasswordAsync(_user, Input.NewPassword!);
        if (!addPasswordResult.Succeeded) {
            Logger.LogWarning("Failed to set the password for the user with Id {UserId}.", _user.Id);
            _message = $"Error: {string.Join(",", addPasswordResult.Errors.Select(error => error.Description))}";
            return;
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("The password for the user with Id {UserId} was set.", _user.Id);
        NavigationManager.ReloadPageWithStatus("Your password has been set.", HttpContext);
    }

    private sealed class InputModel {
        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string? NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string? ConfirmPassword { get; set; }
    }
}