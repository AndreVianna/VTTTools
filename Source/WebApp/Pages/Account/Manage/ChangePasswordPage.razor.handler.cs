namespace VttTools.WebApp.Pages.Account.Manage;

public class ChangePasswordPageHandler {
    private UserManager<User> _userManager = null!;
    private NavigationManager _navigationManager = null!;
    private SignInManager<User> _signInManager = null!;
    private IIdentityUserAccessor _userAccessor = null!;
    private ILogger<ChangePasswordPage> _logger = null!;
    private HttpContext _httpContext = null!;

    internal ChangePasswordPageState State { get; } = new();

    public async Task<bool> InitializeAsync(
        HttpContext httpContext,
        UserManager<User> userManager,
        NavigationManager navigationManager,
        SignInManager<User> signInManager,
        IIdentityUserAccessor userAccessor,
        ILogger<ChangePasswordPage> logger) {
        _httpContext = httpContext;
        _userManager = userManager;
        _navigationManager = navigationManager;
        _signInManager = signInManager;
        _userAccessor = userAccessor;
        _logger = logger;

        var result = await userAccessor.GetCurrentUserOrRedirectAsync(httpContext, userManager);
        if (result.IsFailure)
            return false;

        State.User = result.Value;
        State.HasPassword = await userManager.HasPasswordAsync(State.User);

        if (!State.HasPassword) {
            navigationManager.RedirectTo("account/manage/set_password");
            return false;
        }

        return true;
    }

    public async Task<bool> ChangePasswordAsync() {
        var changePasswordResult = await _userManager.ChangePasswordAsync(
            State.User,
            State.Input.OldPassword,
            State.Input.NewPassword);

        if (!changePasswordResult.Succeeded) {
            State.Message = $"Error: {string.Join(",", changePasswordResult.Errors.Select(error => error.Description))}";
            return false;
        }

        await _signInManager.RefreshSignInAsync(State.User);
        _logger.LogInformation("User changed their password successfully.");

        _httpContext.SetStatusMessage("Your password has been changed");
        _navigationManager.Reload();
        return true;
    }
}