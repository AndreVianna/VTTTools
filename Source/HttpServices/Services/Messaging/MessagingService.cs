namespace HttpServices.Services.Messaging;

public class MessagingService(IEmailSender<User> emailSender)
    : MessagingService<User>(emailSender);

public class MessagingService<TUser>(IEmailSender<TUser> emailSender)
    : MessagingService<TUser, string>(emailSender)
    where TUser : User;

public class MessagingService<TUser, TKey>(IEmailSender<TUser> emailSender)
    : IMessagingService<TUser>
    where TUser : User<TKey>
    where TKey : IEquatable<TKey> {
    public Task SendConfirmationEmailAsync(TUser user, string code, string callbackAbsoluteUri, string? returnUrl = null) {
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var builder = new UriBuilder(callbackAbsoluteUri);
        var parameters = new NameValueCollection {
            ["userId"] = user.Id.ToString(),
            ["code"] = code,
            ["returnUrl"] = returnUrl
        };
        builder.Query = parameters.ToString();
        return emailSender.SendConfirmationLinkAsync(user, user.Email!, builder.Uri.ToString());
    }

    public Task SendTwoFactorMessageAsync(TUser user, string token) => Task.CompletedTask;
}
