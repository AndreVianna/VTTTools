namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    [Inject]
    private SignInManager<User> SignInManager { get; set; } = null!;

    internal ChangePasswordPageState State => Handler.State;
    internal ChangePasswordPageInputModel Input => Handler.State.Input;

    protected override bool ConfigureComponent() {
        base.ConfigureComponent();
        return Handler.Configure(UserManager, SignInManager);
    }

    private async Task ChangePasswordAsync() {
        await Handler.ChangePasswordAsync();
        await StateHasChangedAsync();
    }
}