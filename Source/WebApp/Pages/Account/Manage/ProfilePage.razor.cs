namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ProfilePage {
    internal ProfilePageState State => Handler.State;
    internal ProfileInputModel Input => Handler.State.Input;

    private Task UpdateProfileAsync()
        => Handler.UpdateProfileAsync();
}