namespace VttTools.WebApp.Pages.Account.Manage;

public partial class IndexPage {
    private User _user = null!;
    private string? _username;
    private string? _phoneNumber;

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
    private ILogger<IndexPage> Logger { get; set; } = null!;

    [SupplyParameterFromForm]
    private InputModel Input { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        var result = await UserAccessor.GetCurrentUserOrRedirectAsync(HttpContext, UserManager);
        if (result.IsFailure)
            return;
        _user = result.Value;
        _username = await UserManager.GetUserNameAsync(_user);
        _phoneNumber = await UserManager.GetPhoneNumberAsync(_user);

        Input.PhoneNumber ??= _phoneNumber;
    }

    private async Task OnValidSubmitAsync() {
        if (Input.PhoneNumber != _phoneNumber) {
            var setPhoneResult = await UserManager.SetPhoneNumberAsync(_user, Input.PhoneNumber);
            if (!setPhoneResult.Succeeded) {
                Logger.LogWarning("Failed to update the phone number for the user with ID {UserId}.", _user.Id);
                HttpContext.SetStatusMessage("Error: Failed to set phone number.");
                NavigationManager.ReloadPage();
            }
        }

        await SignInManager.RefreshSignInAsync(_user);
        Logger.LogInformation("The profile of user with ID {UserId} was updated.", _user.Id);
        HttpContext.SetStatusMessage("Your profile has been updated.");
        NavigationManager.ReloadPage();
    }

    private sealed class InputModel {
        [Phone]
        [Display(Name = "Phone number")]
        public string? PhoneNumber { get; set; }
    }
}