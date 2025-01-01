namespace HttpServices.Services.Messaging;

public class MessagingService(IEmailSender<ApiClientUser> emailSender)
    : MessagingService<ApiClientUser>(emailSender);

public class MessagingService<TUser>(IEmailSender<TUser> emailSender)
    : MessagingService<TUser, Guid>(emailSender)
    where TUser : ApiClientUser;

public class MessagingService<TUser, TKey>(IEmailSender<TUser> emailSender)
    : IMessagingService<TUser>
    where TUser : ApiClientUser<TKey>
    where TKey : IEquatable<TKey> {
    public Task SendConfirmationEmailAsync(TUser user, String code, String callbackAbsoluteUri, String? returnUrl = null) {
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

    public Task SendTwoFactorMessageAsync(TUser user, String token) => Task.CompletedTask;
}
