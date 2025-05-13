namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [SupplyParameterFromQuery]
    internal virtual string? Id { get; set; }

    [SupplyParameterFromQuery]
    internal virtual string? Code { get; set; }

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.VerifyAsync(Id, Code);
    }

    internal virtual void GoToSignInPage()
        => NavigationManager.GoToSignIn();
}