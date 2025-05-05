namespace VttTools.WebApp.Pages.Account.Manage;

internal class ChangePasswordPageState {
    public string? Message { get; set; }
    public bool HasPassword { get; set; }
    public ChangePasswordPageInputModel Input { get; set; } = new();
}