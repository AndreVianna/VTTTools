namespace HttpServices.Services.Messaging;

internal class MessagingService(IEmailSender emailSender)
    : MessagingService<User>(emailSender)
    , IMessagingService;

internal class MessagingService<TUser>(IEmailSender<TUser> emailSender)
    : MessagingService<TUser, string>(emailSender)
    where TUser : User;

internal class MessagingService<TUser, TKey>(IEmailSender<TUser> emailSender)
    : IMessagingService<TUser>
    where TUser : NamedUser<TKey>
    where TKey : IEquatable<TKey> {
    public Task SendConfirmationEmailAsync(TUser user, string code, string callbackAbsoluteUri, string? returnUrl = null) {
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        var builder = new UriBuilder(callbackAbsoluteUri);
        var parameters = new NameValueCollection {
            ["userId"] = user.Id.ToString(),
            ["code"] = code,
            ["returnUrl"] = returnUrl,
        };
        builder.Query = parameters.ToString();
        return emailSender.SendConfirmationLinkAsync(user, user.Email!, builder.Uri.ToString());
    }

    public Task SendTwoFactorMessageAsync(TUser user, string token) => Task.CompletedTask;
}
