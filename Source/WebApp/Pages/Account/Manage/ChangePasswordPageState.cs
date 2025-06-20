namespace VttTools.WebApp.Pages.Account.Manage;

internal class ChangePasswordPageState {
    public ChangePasswordPageInput Input { get; set; } = new();
    public InputError[] Errors { get; set; } = [];
}