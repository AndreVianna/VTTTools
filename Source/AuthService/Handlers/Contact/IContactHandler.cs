
namespace AuthService.Handlers.Contact;

public interface IContactHandler {
    Task SendConfirmationEmailAsync(User user, string code, string callbackAbsoluteUri, string? returnUrl = null);
    Task SendTwoFactorMessageAsync(User user, string token);
}
