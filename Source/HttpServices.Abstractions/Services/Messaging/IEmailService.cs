namespace HttpServices.Services.Messaging;

public interface IEmailService {
    Task SendEmailAsync(string[] to, string[] cc, string[] bcc, string subject, string body);
}
