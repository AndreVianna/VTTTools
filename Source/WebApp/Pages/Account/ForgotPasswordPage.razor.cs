namespace VttTools.WebApp.Pages.Account;

public partial class ForgotPasswordPage {
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    internal ForgotPasswordPageState State => Handler.State;

    protected override void OnInitialized() {
        base.OnInitialized();
        Handler.Initialize(UserManager, NavigationManager, EmailSender);
    }

    private async Task OnValidSubmitAsync() => await Handler.RequestPasswordResetAsync();
}