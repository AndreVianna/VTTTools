namespace IdentityService.Handlers.Contact;

public class ContactHandler(IEmailSender<User> emailSender)
    : IContactHandler {
    public Task SendConfirmationEmailAsync(User user, string code, string callbackAbsoluteUri, string? returnUrl = null) {
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var builder = new UriBuilder(callbackAbsoluteUri);
        var parameters = new NameValueCollection {
            ["userId"] = user.Id.ToString(),
            ["code"] = code,
            ["returnUrl"] = returnUrl
        };
        builder.Query = parameters.ToString();
        return emailSender.SendConfirmationLinkAsync(user, user.Email, builder.Uri.ToString());
    }

    public Task SendTwoFactorMessageAsync(User user, string token) => Task.CompletedTask;
}
