using System.ComponentModel.DataAnnotations;
using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record RegisterRequest : Request {
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required")]
    [Compare(nameof(Password), ErrorMessage = "Password and confirm password do not match")]
    public string ConfirmPassword { get; init; } = string.Empty;

    [Required(ErrorMessage = "Name is required")]
    [StringLength(128, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 128 characters")]
    public string Name { get; init; } = string.Empty;

    [StringLength(32, ErrorMessage = "Display name cannot exceed 32 characters")]
    public string? DisplayName { get; init; }
}