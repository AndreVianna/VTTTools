namespace VttTools.WebApp.Pages.Account;

public class ConfirmEmailPageHandler {
    private UserManager<User> _userManager = null!;
    private NavigationManager _navigationManager = null!;
    private HttpContext _httpContext = null!;

    internal ConfirmEmailPageState State { get; } = new();

    public async Task InitializeAsync(
        string? userId,
        string? code,
        UserManager<User> userManager,
        NavigationManager navigationManager,
        HttpContext httpContext) {
        _userManager = userManager;
        _navigationManager = navigationManager;
        _httpContext = httpContext;

        if (userId is null || code is null) {
            _navigationManager.RedirectToHome();
            return;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) {
            _httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            State.StatusMessage = $"Error loading user with ID {userId}";
            return;
        }

        var decodedCode = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await _userManager.ConfirmEmailAsync(user, decodedCode);
        State.StatusMessage = result.Succeeded ? "Thank you for confirming your email." : "Error confirming your email.";
    }
}