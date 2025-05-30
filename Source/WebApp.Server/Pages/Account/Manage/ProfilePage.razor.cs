namespace VttTools.WebApp.Server.Pages.Account.Manage;

public partial class ProfilePage {
    internal ProfilePageState State { get; set; } = new();
    internal ProfilePageInput Input => State.Input;

    private Task UpdateProfileAsync()
        => Handler.UpdateProfileAsync();
}