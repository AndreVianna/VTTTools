namespace VttTools.WebApp.Server.Pages.Account.Manage;

internal class ProfileInputModel {
    [MaxLength(128)]
    [Display(Name = "Display Name")]
    public string? DisplayName { get; set; }

    public InputError[] Errors { get; set; } = [];
}