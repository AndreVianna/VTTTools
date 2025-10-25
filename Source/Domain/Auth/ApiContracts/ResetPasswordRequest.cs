using System.ComponentModel.DataAnnotations;

using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record ResetPasswordRequest : Request {
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Reset token is required")]
    public string Token { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string NewPassword { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare(nameof(NewPassword), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; init; } = string.Empty;
}