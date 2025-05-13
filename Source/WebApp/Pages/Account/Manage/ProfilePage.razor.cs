namespace VttTools.WebApp.Pages.Account.Manage;

public partial class ProfilePage {
    internal ProfilePageState State { get; set; } = new();
    internal ProfileInputModel Input => State.Input;

    private Task UpdateProfileAsync()
        => Handler.UpdateProfileAsync();
}