namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandler(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory loggerFactory)
    : PrivateComponentHandler<EmailPageHandler>(httpContext, navigationManager, user, loggerFactory) {
    private const string _confirmEmailChangePage = "account/confirm_email_change";
    private const string _confirmEmailPage = "account/confirm_email";
    private static readonly HtmlEncoder _htmlEncoder = HtmlEncoder.Default;
    private UserManager<User> _userManager = null!;
    private IEmailSender<User> _emailSender = null!;

    internal EmailPageState State { get; } = new();

    public void Configure(UserManager<User> userManager, IEmailSender<User> emailSender) {
        _userManager = userManager;
        _emailSender = emailSender;
        State.ChangeEmailInput.CurrentEmail = CurrentUser.Email;
        State.VerifyEmailInput.CurrentEmail = CurrentUser.Email;
    }

    public async Task SendEmailChangeConfirmationAsync() {
        if (string.IsNullOrWhiteSpace(State.ChangeEmailInput.Email)) {
            HttpContext.SetStatusMessage("Error: The new email cannot be empty.");
            return;
        }

        if (State.ChangeEmailInput.Email == State.ChangeEmailInput.CurrentEmail) {
            HttpContext.SetStatusMessage("Your email was not changed.");
            return;
        }

        var code = await _userManager.GenerateChangeEmailTokenAsync(CurrentUser, State.ChangeEmailInput.Email);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(NavigationManager.GetRelativeUrl(_confirmEmailChangePage, ps => {
            ps.Add("userId", CurrentUser.Id);
            ps.Add("email", State.ChangeEmailInput.Email);
            ps.Add("code", code);
        }));

        await _emailSender.SendConfirmationLinkAsync(CurrentUser, State.ChangeEmailInput.Email, link);
        Logger.LogInformation("Change email link sent to user with ID {UserId}", CurrentUser.Id);
        HttpContext.SetStatusMessage("A confirmation link was sent to the new email. Please check your inbox.");
    }

    public async Task SendEmailVerificationAsync() {
        var code = await _userManager.GenerateEmailConfirmationTokenAsync(CurrentUser);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(NavigationManager.GetRelativeUrl(_confirmEmailPage, ps => {
            ps.Add("userId", CurrentUser.Id);
            ps.Add("code", code);
        }));

        await _emailSender.SendConfirmationLinkAsync(CurrentUser, CurrentUser.Email, link);
        Logger.LogInformation("Verification email sent to user with ID {UserId}", CurrentUser.Id);
        HttpContext.SetStatusMessage("A confirmation link was sent to the informed email. Please check your inbox.");
    }
}