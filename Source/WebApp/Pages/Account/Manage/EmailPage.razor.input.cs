namespace VttTools.WebApp.Pages.Account.Manage;

internal class EmailPageInputModel {
    [Required]
    [EmailAddress]
    public string? Email { get; set; }
    public InputError[] Errors { get; set; } = [];
}