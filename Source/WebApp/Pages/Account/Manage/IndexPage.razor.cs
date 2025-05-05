namespace VttTools.WebApp.Pages.Account.Manage;

public partial class IndexPage {
    internal IndexPageState State => Handler.State;
    internal IndexPageInputModel Input => Handler.State.Input;

    protected override bool ConfigureComponent() {
        Handler.Configure(UserManager);
        return true;
    }

    private Task UpdateProfileAsync() => Handler.UpdateProfileAsync();
}