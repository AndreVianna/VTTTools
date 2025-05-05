namespace VttTools.WebApp.Pages.Account.Manage;

internal class ProfilePageInputModel {
    [MaxLength(128)]
    [Display(Name = "Display name")]
    public string? DisplayName { get; set; }

    public InputError[] Errors { get; set; } = [];
}