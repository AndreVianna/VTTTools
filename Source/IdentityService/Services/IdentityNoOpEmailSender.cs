using HttpServices.Abstractions.Model;

namespace IdentityService.Account;

internal sealed class IdentityNoOpEmailSender : IEmailSender<ApiClientUser> {
    private readonly IEmailSender _emailSender = new NoOpEmailSender();

    public Task SendConfirmationLinkAsync(ApiClientUser user, string email, string confirmationLink)
        => _emailSender.SendEmailAsync(email, "Confirm your email", $"Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.");

    public Task SendPasswordResetLinkAsync(ApiClientUser user, string email, string resetLink)
        => _emailSender.SendEmailAsync(email, "Reset your password", $"Please reset your password by <a href='{resetLink}'>clicking here</a>.");

    public Task SendPasswordResetCodeAsync(ApiClientUser user, string email, string resetCode)
        => _emailSender.SendEmailAsync(email, "Reset your password", $"Please reset your password using the following code: {resetCode}");
}
