using System.ComponentModel.DataAnnotations;

using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record ChangePasswordRequest : Request {
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; init; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "New password must be between 8 and 100 characters")]
    public string NewPassword { get; init; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare(nameof(NewPassword), ErrorMessage = "New password and confirmation do not match")]
    public string ConfirmNewPassword { get; init; } = string.Empty;
}