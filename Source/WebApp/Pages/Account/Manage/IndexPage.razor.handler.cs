namespace VttTools.WebApp.Pages.Account.Manage;

public class IndexPageHandler {
    private User _user = null!;
    private HttpContext _httpContext = null!;
    private UserManager<User> _userManager = null!;
    private SignInManager<User> _signInManager = null!;
    private NavigationManager _navigationManager = null!;
    private IIdentityUserAccessor _userAccessor = null!;
    private ILogger<IndexPage> _logger = null!;

    internal IndexPageState State { get; } = new();

    public async Task<bool> TryInitializeAsync(
        HttpContext httpContext,
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        NavigationManager navigationManager,
        IIdentityUserAccessor userAccessor,
        ILogger<IndexPage> logger) {
        _httpContext = httpContext;
        _userManager = userManager;
        _signInManager = signInManager;
        _navigationManager = navigationManager;
        _userAccessor = userAccessor;
        _logger = logger;

        var result = await userAccessor.GetCurrentUserOrRedirectAsync(httpContext, userManager);
        if (result.IsFailure)
            return false;

        _user = result.Value;
        State.Username = await userManager.GetUserNameAsync(_user);
        State.PhoneNumber = await userManager.GetPhoneNumberAsync(_user);

        State.Input.PhoneNumber ??= State.PhoneNumber;
        return true;
    }

    public async Task<bool> UpdateProfileAsync() {
        if (State.Input.PhoneNumber != State.PhoneNumber) {
            var setPhoneResult = await _userManager.SetPhoneNumberAsync(_user, State.Input.PhoneNumber);
            if (!setPhoneResult.Succeeded) {
                _logger.LogWarning("Failed to update the phone number for the user with ID {UserId}.", _user.Id);
                _httpContext.SetStatusMessage("Error: Failed to set phone number.");
                _navigationManager.Reload();
                return false;
            }
        }

        await _signInManager.RefreshSignInAsync(_user);
        _logger.LogInformation("The profile of user with ID {UserId} was updated.", _user.Id);
        _httpContext.SetStatusMessage("Your profile has been updated.");
        _navigationManager.Reload();
        return true;
    }
}