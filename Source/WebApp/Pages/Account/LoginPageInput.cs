namespace VttTools.WebApp.Pages.Account;

internal class LoginPageInput {
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [Display(Name = "Remember me?")]
    public bool RememberMe { get; set; }

    public InputError[] Errors { get; set; } = [];
}