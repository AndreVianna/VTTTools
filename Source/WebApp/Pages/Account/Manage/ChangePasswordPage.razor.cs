namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ChangePasswordPage {
    internal virtual ChangePasswordPageState State { get; set; } = new();
    internal virtual ChangePasswordInputModel Input => State.Input;

    internal virtual async Task ChangePasswordAsync() {
        await Handler.ChangePasswordAsync();
        await StateHasChangedAsync();
    }
}