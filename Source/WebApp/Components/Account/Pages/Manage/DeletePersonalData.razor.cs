namespace WebApp.Components.Account.Pages.Manage;

public partial class DeletePersonalData {
    private string? _message;
    private User _user = null!;
    private bool _requirePassword;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; } = new();

    protected override async Task OnInitializedAsync() {
        _user = (await UserAccessor.GetRequiredUserAsync(HttpContext, CancellationToken.None))!;
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
        Logger.LogInformation("User with ID '{UserId}' deleted themselves.", userId);

        RedirectManager.RedirectToCurrentPage();
    }

    private sealed class InputModel {
        [DataType(DataType.Password)]
        public string Password { get; set; } = "";
    }
}
