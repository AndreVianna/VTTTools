namespace VttTools.Auth.Services;

public class ConsoleEmailService : IEmailService {
    public Task SendPasswordResetEmailAsync(string toEmail, string resetLink) {
        Console.WriteLine("[EMAIL] Password Reset Email");
        Console.WriteLine($"[EMAIL] To: {toEmail}");
        Console.WriteLine($"[EMAIL] Reset Link: {resetLink}");
        Console.WriteLine("[EMAIL] This link expires in 24 hours");
        return Task.CompletedTask;
    }
}