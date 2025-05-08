namespace VttTools.WebApp.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal ForgotPasswordPageState State => Handler.State;

    private Task ResetPasswordAsync()
        => Handler.RequestPasswordResetAsync();
}