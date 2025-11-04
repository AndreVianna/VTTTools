namespace VttTools.Domain.Admin.ApiContracts;
public sealed record AssignRoleRequest : Request {
    [Required(ErrorMessage = "Role name is required")]
    [MaxLength(50, ErrorMessage = "Role name cannot exceed 50 characters")]
    [RegularExpression("^[A-Za-z]+$", ErrorMessage = "Role name must contain only letters")]
    public required string RoleName { get; init; }
}
