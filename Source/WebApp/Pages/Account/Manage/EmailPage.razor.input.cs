namespace VttTools.WebApp.Pages.Account.Manage;

internal class EmailPageInputModel {
    [Required]
    [EmailAddress]
    [Display(Name = "New email")]
    public string? NewEmail { get; set; }
}