namespace VttTools.WebApp.Pages.Account;

public partial class RegisterPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;
    [Inject]
    private IEmailSender<User> EmailSender { get; set; } = null!;

    [SupplyParameterFromQuery]
    private string? ReturnUrl { get; set; }

    internal RegisterPageState State => Handler.State;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(UserManager, SignInManager, EmailSender);
        return true;
    }

    public async Task RegisterUser(EditContext _) {
        await Handler.RegisterUserAsync(ReturnUrl);
        await StateHasChangedAsync();
    }
}