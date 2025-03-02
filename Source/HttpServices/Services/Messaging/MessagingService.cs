namespace HttpServices.Services.Messaging;

internal class MessagingService<TUser, TProfile>(IEmailSender<TUser> emailSender)
    : MessagingService<TUser, string, TProfile>(emailSender)
    where TUser : class, IIdentityUser<TProfile>
    where TProfile : class, IUserProfile;

internal class MessagingService<TUser, TKey, TProfile>(IEmailSender<TUser> emailSender)
    : IMessagingService<TUser>
    where TUser : class, IIdentityUser<TKey, TProfile>
    where TKey : IEquatable<TKey>
    where TProfile : class, IUserProfile {
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
