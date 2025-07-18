namespace VttTools.WebApp.Pages.Account.Manage;

public class EmailPageHandler(EmailPage page)
    : PageHandler<EmailPageHandler, EmailPage>(page) {
    private const string _confirmEmailChangePage = "account/confirm_email_change";
    private const string _confirmEmailPage = "account/confirm_email";
    private static readonly HtmlEncoder _htmlEncoder = HtmlEncoder.Default;

    public override bool Configure() {
        if (!base.Configure())
            return false;
        Page.State.ChangeEmailInput.CurrentEmail = Page.AccountOwner.Email;
        Page.State.VerifyEmailInput.CurrentEmail = Page.AccountOwner.Email;
        return true;
    }

    public async Task SendEmailChangeConfirmationAsync() {
        if (string.IsNullOrWhiteSpace(Page.State.ChangeEmailInput.Email)) {
            Page.SetStatusMessage("Error: The new email cannot be empty.");
            return;
        }

        if (Page.State.ChangeEmailInput.Email == Page.State.ChangeEmailInput.CurrentEmail) {
            Page.SetStatusMessage("Your email was not changed.");
            return;
        }

        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var code = await userManager.GenerateChangeEmailTokenAsync(Page.AccountOwner, Page.State.ChangeEmailInput.Email);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(Page.NavigationManager.GetRelativeUrl(_confirmEmailChangePage, ps => {
            ps.Add("userId", Page.AccountOwner.Id);
            ps.Add("email", Page.State.ChangeEmailInput.Email);
            ps.Add("code", code);
        }));

        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendConfirmationLinkAsync(Page.AccountOwner, Page.State.ChangeEmailInput.Email, link);
        Page.Logger.LogInformation("Change email link sent to user with ID {UserId}", Page.AccountOwner.Id);
        Page.SetStatusMessage("A confirmation link was sent to the new email. Please check your inbox.");
    }

    public async Task SendEmailVerificationAsync() {
        var userManager = Page.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
        var code = await userManager.GenerateEmailConfirmationTokenAsync(Page.AccountOwner);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var link = _htmlEncoder.Encode(Page.NavigationManager.GetRelativeUrl(_confirmEmailPage, ps => {
            ps.Add("userId", Page.AccountOwner.Id);
            ps.Add("code", code);
        }));

        var emailSender = Page.HttpContext.RequestServices.GetRequiredService<IEmailSender<User>>();
        await emailSender.SendConfirmationLinkAsync(Page.AccountOwner, Page.AccountOwner.Email, link);
        Page.Logger.LogInformation("Verification email sent to user with ID {UserId}", Page.AccountOwner.Id);
        Page.SetStatusMessage("A confirmation link was sent to the informed email. Please check your inbox.");
    }
}