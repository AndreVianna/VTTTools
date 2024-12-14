namespace AuthService.Account;

internal sealed class NoOpEmailSender : IEmailSender {
    public Task SendEmailAsync(string email, string subject, string body) => Task.CompletedTask;
}
