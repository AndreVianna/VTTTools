namespace VttTools.WebApp.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal ForgotPasswordPageState State => Handler.State;

    protected override bool ConfigureComponent() {
        Handler.Configure(UserManager, EmailSender);
        return true;
    }

    private Task ResetPasswordAsync()
        => Handler.RequestPasswordResetAsync();
}