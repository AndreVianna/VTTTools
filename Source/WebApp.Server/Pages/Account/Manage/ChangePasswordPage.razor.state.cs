namespace VttTools.WebApp.Server.Pages.Account.Manage;

internal class ChangePasswordPageState {
    public ChangePasswordInputModel Input { get; set; } = new();
    public InputError[] Errors { get; set; } = [];
}