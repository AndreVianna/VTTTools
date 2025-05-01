namespace VttTools.WebApp.Pages.Account.Manage;

internal class EmailPageState {
    public string? Message { get; set; }
    public User User { get; set; } = null!;
    public string? Email { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public EmailPageInputModel Input { get; set; } = new();
}