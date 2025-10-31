using System.ComponentModel.DataAnnotations;

using VttTools.Common.ApiContracts;

namespace VttTools.Auth.ApiContracts;

public record UpdateProfileRequest : Request {
    [StringLength(128, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 128 characters")]
    public string? Name { get; init; }

    [StringLength(32, ErrorMessage = "Display name cannot exceed 32 characters")]
    public string? DisplayName { get; init; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [MaxLength(256, ErrorMessage = "Email cannot exceed 256 characters")]
    public string? Email { get; init; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? PhoneNumber { get; init; }
}