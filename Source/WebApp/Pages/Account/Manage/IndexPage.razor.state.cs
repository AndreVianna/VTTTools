namespace VttTools.WebApp.Pages.Account.Manage;

internal class IndexPageState {
    public string? Username { get; set; }
    public string? PhoneNumber { get; set; }
    public IndexPageInputModel Input { get; set; } = new();
}