namespace WebApp.Components.Account.Pages.Manage;

public partial class Index {
    private User _user = null!;
    private string? _username;
    private string? _phoneNumber;

    [CascadingParameter]
    private HttpContext HttpContext { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        _user = await UserAccessor.GetRequiredUserAsync(HttpContext);
        _username = await UserManager.GetUserNameAsync(_user);
        _phoneNumber = await UserManager.GetPhoneNumberAsync(_user);

        Input.PhoneNumber ??= _phoneNumber;
    }

    private async Task OnValidSubmitAsync() {
        if (Input.PhoneNumber != _phoneNumber) {
            var setPhoneResult = await UserManager.SetPhoneNumberAsync(_user, Input.PhoneNumber);
            if (!setPhoneResult.Succeeded) {
                RedirectManager.RedirectToCurrentPageWithStatus("Error: Failed to set phone number.", HttpContext);
            }
        }

        await SignInManager.RefreshSignInAsync(_user);
        RedirectManager.RedirectToCurrentPageWithStatus("Your profile has been updated", HttpContext);
    }

    private sealed class InputModel {
        [Phone]
        [Display(Name = "Phone number")]
        public string? PhoneNumber { get; set; }
    }
}
