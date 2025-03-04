﻿namespace WebApp.Components.Account.Pages.Manage;

public partial class ChangePassword {
    private string? _message;
    private User _user = null!;
    private bool _hasPassword;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        _user = (await UserAccessor.GetRequiredUserAsync(HttpContext, CancellationToken.None))!;
        _hasPassword = await UserManager.HasPasswordAsync(_user);
        if (!_hasPassword)
            RedirectManager.RedirectTo("Account/Manage/SetPassword");
    }

    private async Task OnValidSubmitAsync() {
        var changePasswordResult = await UserManager.ChangePasswordAsync(_user, Input.OldPassword, Input.NewPassword);
        if (!changePasswordResult.Succeeded) {
            _message = $"Error: {string.Join(",", changePasswordResult.Errors.Select(error => error.Description))}";
            return;
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("User changed their password successfully.");

        RedirectManager.RedirectToCurrentPageWithStatus("Your password has been changed", HttpContext);
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
