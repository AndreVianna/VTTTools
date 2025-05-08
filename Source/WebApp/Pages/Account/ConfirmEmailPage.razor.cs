namespace VttTools.WebApp.Pages.Account;

public partial class ConfirmEmailPage {
    [SupplyParameterFromQuery]
    internal string? Id { get; set; }

    [SupplyParameterFromQuery]
    internal string? Code { get; set; }

    protected override async Task<bool> ConfigureAsync()
        => await base.ConfigureAsync() && await Handler.VerifyAsync(Id, Code);

    internal void GoToSignInPage()
        => NavigationManager.GoToSignIn();
}