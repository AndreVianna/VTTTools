namespace VttTools.WebApp.Server.Pages.Account.Manage;

internal class ProfilePageInput {
    [MaxLength(128)]
    [Display(Name = "Image Name")]
    public string? DisplayName { get; set; }

    public InputError[] Errors { get; set; } = [];
}