namespace VttTools.WebApp.Pages.Account;

internal class ForgotPasswordInputModel {
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    public InputError[] Errors { get; set; } = [];
}