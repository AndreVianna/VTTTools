namespace VttTools.WebApp.Server.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal ForgotPasswordPageState State { get; set; } = new();

    internal ForgotPasswordPageInput Input => State.Input;

    private Task ResetPasswordAsync()
        => Handler.RequestPasswordResetAsync();
}