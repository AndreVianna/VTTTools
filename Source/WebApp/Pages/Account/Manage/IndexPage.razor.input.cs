namespace VttTools.WebApp.Pages.Account.Manage;

internal class IndexPageInputModel {
    [Phone]
    [Display(Name = "Phone number")]
    public string? PhoneNumber { get; set; }

    public InputError[] Errors { get; set; } = [];
}