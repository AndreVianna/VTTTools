namespace HttpServices.Services.Messaging;

internal class NullEmailSender : IEmailSender {
    public Task SendConfirmationLinkAsync(User user, string email, string confirmationLink) => Task.CompletedTask;

    public Task SendPasswordResetLinkAsync(User user, string email, string resetLink) => Task.CompletedTask;

    public Task SendPasswordResetCodeAsync(User user, string email, string resetCode) => Task.CompletedTask;
}
