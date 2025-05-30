namespace VttTools.WebApp.Server.Pages.Account.Manage;

public partial class ChangePasswordPage {
    internal virtual ChangePasswordPageState State { get; set; } = new();
    internal virtual ChangePasswordPageInput Input => State.Input;

    internal virtual async Task ChangePasswordAsync() {
        await Handler.ChangePasswordAsync();
        await StateHasChangedAsync();
    }
}