namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandler(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : AuthorizedComponentHandler<EmailPageHandler, EmailPage>(httpContext, navigationManager, currentUser, loggerFactory) {
    private const string _confirmEmailChangePage = "account/confirm_email_change";
    private const string _confirmEmailPage = "account/confirm_email";
    private static readonly HtmlEncoder _htmlEncoder = HtmlEncoder.Default;
    private UserManager<User> _userManager = null!;
    private IEmailSender<User> _emailSender = null!;

    internal EmailPageState State { get; } = new();

    public void Configure(UserManager<User> userManager, IEmailSender<User> emailSender) {
        _userManager = userManager;
        _emailSender = emailSender;
        State.Input.Email = CurrentUser.EmailConfirmed
            ? string.Empty
            : CurrentUser.Email;
    }

    public async Task SendEmailChangeConfirmationAsync() {
        if (string.IsNullOrWhiteSpace(State.Input.Email)) {
            HttpContext.SetStatusMessage("Error: The new email cannot be empty.");
            return;
        }

        if (State.Input.Email == CurrentUser.Email) {
            HttpContext.SetStatusMessage("Your email was not changed.");
            return;
        }

        var code = await _userManager.GenerateChangeEmailTokenAsync(CurrentUser, State.Input.Email);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(NavigationManager.GetRelativeUrl(_confirmEmailChangePage, ps => {
            ps.Add("userId", CurrentUser.Id);
            ps.Add("email", State.Input.Email);
            ps.Add("code", code);
        }));

        await _emailSender.SendConfirmationLinkAsync(CurrentUser, State.Input.Email, link);
        Logger.LogInformation("Change email link sent to user with ID {UserId}", CurrentUser.Id);
        HttpContext.SetStatusMessage("A confirmation link was sent to the new email. Please check your email.");
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
        HttpContext.SetStatusMessage("A confirmation link was sent to the email. Please check your email.");
    }
}