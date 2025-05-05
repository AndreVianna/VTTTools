namespace VttTools.WebApp.Pages.Account.Manage;

internal class ChangeEmailInputModel {
    public string CurrentEmail { get; set; } = null!;
    [Required]
    [EmailAddress]
    public string? Email { get; set; }
    public InputError[] Errors { get; set; } = [];
}

internal class VerifyEmailInputModel {
    public string CurrentEmail { get; set; } = null!;
    public InputError[] Errors { get; set; } = [];
}