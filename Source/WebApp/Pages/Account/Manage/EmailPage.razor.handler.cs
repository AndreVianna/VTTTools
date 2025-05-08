namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandler(IAccountPage page)
    : AccountPageHandler<EmailPageHandler>(page) {
    private const string _confirmEmailChangePage = "account/confirm_email_change";
    private const string _confirmEmailPage = "account/confirm_email";
    private static readonly HtmlEncoder _htmlEncoder = HtmlEncoder.Default;

    internal EmailPageState State { get; } = new();

    public override bool Configure() {
        if (!base.Configure()) return false;
        State.ChangeEmailInput.CurrentEmail = Page.CurrentUser.Email;
        State.VerifyEmailInput.CurrentEmail = Page.CurrentUser.Email;
        return true;
    }

    public async Task SendEmailChangeConfirmationAsync() {
        if (string.IsNullOrWhiteSpace(State.ChangeEmailInput.Email)) {
            Page.SetStatusMessage("Error: The new email cannot be empty.");
            return;
        }

        if (State.ChangeEmailInput.Email == State.ChangeEmailInput.CurrentEmail) {
            Page.SetStatusMessage("Your email was not changed.");
            return;
        }

        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var code = await userManager.GenerateChangeEmailTokenAsync(Page.CurrentUser, State.ChangeEmailInput.Email);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(Page.NavigationManager.GetRelativeUrl(_confirmEmailChangePage, ps => {
            ps.Add("userId", Page.CurrentUser.Id);
            ps.Add("email", State.ChangeEmailInput.Email);
            ps.Add("code", code);
        }));

        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendConfirmationLinkAsync(Page.CurrentUser, State.ChangeEmailInput.Email, link);
        Page.Logger.LogInformation("Change email link sent to user with ID {UserId}", Page.CurrentUser.Id);
        Page.SetStatusMessage("A confirmation link was sent to the new email. Please check your inbox.");
    }

    public async Task SendEmailVerificationAsync() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var code = await userManager.GenerateEmailConfirmationTokenAsync(Page.CurrentUser);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(Page.NavigationManager.GetRelativeUrl(_confirmEmailPage, ps => {
            ps.Add("userId", Page.CurrentUser.Id);
            ps.Add("code", code);
        }));

        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendConfirmationLinkAsync(Page.CurrentUser, Page.CurrentUser.Email, link);
        Page.Logger.LogInformation("Verification email sent to user with ID {UserId}", Page.CurrentUser.Id);
        Page.SetStatusMessage("A confirmation link was sent to the informed email. Please check your inbox.");
    }
}