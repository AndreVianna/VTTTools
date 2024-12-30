
namespace AuthService.Handlers.Contact;

public interface IContactHandler {
    Task SendConfirmationLinkAsync(User user, string code, string? returnUrl = null);
    Task SendTwoFactorMessageAsync(User user, string token);
}

public class ContactHandler(IEmailSender<User> emailSender,
                            NavigationManager navigationManager)
    : IContactHandler {
    public Task SendConfirmationLinkAsync(User user, string code, string? returnUrl = null) {
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var uri = navigationManager.ToAbsoluteUri("Account/ConfirmEmail").AbsoluteUri;
        var parameters = new Dictionary<string, object?> {
            ["userId"] = user.Id,
            ["code"] = code,
            ["returnUrl"] = returnUrl,
        };
        var callbackUrl = navigationManager.GetUriWithQueryParameters(uri, parameters);
        return emailSender.SendConfirmationLinkAsync(user, user.Email, callbackUrl);
    }
    public Task SendTwoFactorMessageAsync(User user, string token) => Task.CompletedTask;
}
