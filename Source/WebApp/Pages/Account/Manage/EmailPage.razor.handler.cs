namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandler {
    private UserManager<User> _userManager = null!;
    private NavigationManager _navigationManager = null!;
    private IIdentityUserAccessor _userAccessor = null!;
    private IEmailSender<User> _emailSender = null!;
    private ILogger<EmailPage> _logger = null!;
    private HttpContext _httpContext = null!;

    internal EmailPageState State { get; } = new();

    public async Task<bool> TryInitializeAsync(
        HttpContext httpContext,
        UserManager<User> userManager,
        NavigationManager navigationManager,
        IIdentityUserAccessor userAccessor,
        IEmailSender<User> emailSender,
        ILogger<EmailPage> logger) {
        _httpContext = httpContext;
        _userManager = userManager;
        _navigationManager = navigationManager;
        _userAccessor = userAccessor;
        _emailSender = emailSender;
        _logger = logger;

        var result = await userAccessor.GetCurrentUserOrRedirectAsync(httpContext, userManager);
        if (result.IsFailure)
            return false;

        State.User = result.Value;
        State.Email = await userManager.GetEmailAsync(State.User);
        State.IsEmailConfirmed = await userManager.IsEmailConfirmedAsync(State.User);

        State.Input.NewEmail ??= State.Email;
        return true;
    }

    public async Task ChangeEmailAsync() {
        if (State.Input.NewEmail is null || State.Input.NewEmail == State.Email) {
            State.Message = "Your email is unchanged.";
            return;
        }

        var userId = await _userManager.GetUserIdAsync(State.User);
        var code = await _userManager.GenerateChangeEmailTokenAsync(State.User, State.Input.NewEmail);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = _navigationManager.GetUriWithQueryParameters(
            _navigationManager.ToAbsoluteUri("account/confirm_email_change").AbsoluteUri,
            new Dictionary<string, object?> { ["userId"] = userId, ["email"] = State.Input.NewEmail, ["code"] = code });

        await _emailSender.SendConfirmationLinkAsync(State.User, State.Input.NewEmail, HtmlEncoder.Default.Encode(callbackUrl));

        State.Message = "Confirmation link to change email sent. Please check your email.";
    }

    public async Task SendEmailVerificationAsync() {
        if (State.Email is null)
            return;

        var userId = await _userManager.GetUserIdAsync(State.User);
        var code = await _userManager.GenerateEmailConfirmationTokenAsync(State.User);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var callbackUrl = _navigationManager.GetUriWithQueryParameters(
            _navigationManager.ToAbsoluteUri("account/confirm_email").AbsoluteUri,
            new Dictionary<string, object?> { ["userId"] = userId, ["code"] = code });

        await _emailSender.SendConfirmationLinkAsync(State.User, State.Email, HtmlEncoder.Default.Encode(callbackUrl));

        _logger.LogInformation("Verification email sent to user with ID {UserId}", userId);
        State.Message = "Verification email sent. Please check your email.";
    }
}