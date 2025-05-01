namespace VttTools.WebApp.Pages.Account;

internal class ForgotPasswordPageInputModel {
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    public InputError[] Errors { get; set; } = [];
}