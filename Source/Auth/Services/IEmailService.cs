namespace VttTools.Auth.Services;

public interface IEmailService {
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}
