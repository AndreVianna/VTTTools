namespace HttpServices.Services.Messaging;

internal sealed class NullEmailSender : IEmailSender {
    public Task SendConfirmationLinkAsync(NamedUser user, string email, string confirmationLink) => Task.CompletedTask;

    public Task SendPasswordResetLinkAsync(NamedUser user, string email, string resetLink) => Task.CompletedTask;

    public Task SendPasswordResetCodeAsync(NamedUser user, string email, string resetCode) => Task.CompletedTask;
}
