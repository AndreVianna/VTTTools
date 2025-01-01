namespace HttpServices.Services.Messaging;

public interface IMessagingService<in TUser>
    where TUser : class {
    Task SendConfirmationEmailAsync(TUser user, string code, string callbackAbsoluteUri, string? returnUrl = null);
    Task SendTwoFactorMessageAsync(TUser user, string token);
}
