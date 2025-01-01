namespace IdentityService.Account;

internal interface IEmailSender {
    Task SendEmailAsync(string email, string subject, string body);
}
