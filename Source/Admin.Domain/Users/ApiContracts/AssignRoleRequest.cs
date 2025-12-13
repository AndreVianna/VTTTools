namespace VttTools.Admin.Users.ApiContracts;

public sealed record AssignRoleRequest : Request {
    [Required(ErrorMessage = "IsDefault name is required")]
    [MaxLength(50, ErrorMessage = "IsDefault name cannot exceed 50 characters")]
    [RegularExpression("^[A-Za-z]+$", ErrorMessage = "IsDefault name must contain only letters")]
    public required string RoleName { get; init; }
}