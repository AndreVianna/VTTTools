namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [SupplyParameterFromQuery]
    internal string? UserId { get; set; }

    [SupplyParameterFromQuery]
    internal string? Code { get; set; }

    internal ConfirmEmailPageState State => Handler.State;

    protected override async Task ConfigureComponentAsync() {
        await Handler.InitializeAsync(UserManager, UserId, Code);
        if (State.IsConfirmed)
            return;
        HttpContext.SetStatusMessage("The email confirmation code is invalid, please try again.");
        NavigationManager.ReplaceWith(string.Empty);
    }
}