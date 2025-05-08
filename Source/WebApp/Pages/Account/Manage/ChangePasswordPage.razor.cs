namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    internal ChangePasswordPageState State => Handler.State;
    internal ChangePasswordInputModel Input => Handler.State.Input;

    private async Task ChangePasswordAsync() {
        await Handler.ChangePasswordAsync();
        await StateHasChangedAsync();
    }
}