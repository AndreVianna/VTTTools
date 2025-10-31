namespace VttTools.Auth.Services;

public class ConsoleEmailService : IEmailService {
    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink) {
        Console.WriteLine("[EMAIL] Password Reset Email");
        Console.WriteLine($"[EMAIL] To: {toEmail}");
        Console.WriteLine($"[EMAIL] Reset Link: {resetLink}");
        Console.WriteLine("[EMAIL] This link expires in 24 hours");
        return Task.CompletedTask;
    }

    public Task SendEmailConfirmationAsync(string toEmail, string confirmationLink) {
        Console.WriteLine("[EMAIL] Email Confirmation");
        Console.WriteLine($"[EMAIL] To: {toEmail}");
        Console.WriteLine($"[EMAIL] Confirmation Link: {confirmationLink}");
        Console.WriteLine("[EMAIL] Please click the link to confirm your email address");
        return Task.CompletedTask;
    }
}