namespace HttpServices.Services.Messaging;

public interface IMessageService<in TUser>
    where TUser : class {
    Task SendAccountConfirmationMessageAsync(TUser user, string? confirmationLink = null);
    Task SendTwoFactorMessageAsync(TUser user, string token);
    Task SendPasswordResetMessageAsync(TUser user, string resetLink);
}
