namespace VttTools.WebApp.Pages.Account.Manage;

internal class ChangePasswordPageState {
    public string? Message { get; set; }
    public User User { get; set; } = null!;
    public bool HasPassword { get; set; }
    public ChangePasswordPageInputModel Input { get; set; } = new();
}