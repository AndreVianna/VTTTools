namespace VttTools.WebApp.Pages.Account.Manage;

public partial class EmailPage {
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal EmailPageState State => Handler.State;
    internal EmailPageInputModel Input => Handler.State.Input;

    protected override bool ConfigureComponent() {
        Handler.Configure(UserManager, EmailSender);
        return true;
    }

    private Task SendEmailChangeConfirmationAsync()
        => Handler.SendEmailChangeConfirmationAsync();

    private Task SendEmailVerificationAsync()
        => Handler.SendEmailVerificationAsync();
}