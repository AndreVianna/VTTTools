namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ProfilePage {
    internal ProfilePageState State => Handler.State;
    internal ProfilePageInputModel Input => Handler.State.Input;

    protected override bool ConfigureComponent() {
        Handler.Configure(UserManager);
        return true;
    }

    private Task UpdateProfileAsync() => Handler.UpdateProfileAsync();
}