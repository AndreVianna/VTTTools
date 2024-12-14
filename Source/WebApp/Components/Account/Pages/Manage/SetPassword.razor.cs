namespace WebApp.Components.Account.Pages.Manage;

public partial class SetPassword {
    private string? _message;
    private ApplicationUser _user = default!;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = default!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        _user = await UserAccessor.GetRequiredUserAsync(HttpContext);

        var hasPassword = await UserManager.HasPasswordAsync(_user);
        if (hasPassword)
            RedirectManager.RedirectTo("Account/Manage/ChangePassword");
    }

    private async Task OnValidSubmitAsync() {
        var addPasswordResult = await UserManager.AddPasswordAsync(_user, Input.NewPassword!);
        if (!addPasswordResult.Succeeded) {
            _message = $"Error: {string.Join(",", addPasswordResult.Errors.Select(error => error.Description))}";
            return;
        }

        await SignInManager.RefreshSignInAsync(_user);
        RedirectManager.RedirectToCurrentPageWithStatus("Your password has been set.", HttpContext);
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
