namespace VttTools.Domain.Admin.ApiContracts.Library;

public sealed record TransferOwnershipRequest : Request {
    [Required(ErrorMessage = "Action is required")]
    [MaxLength(10, ErrorMessage = "Action cannot exceed 10 characters")]
    [RegularExpression("^(take|grant)$", ErrorMessage = "Action must be 'take' or 'grant'")]
    public required string Action { get; init; }

    public Guid? TargetUserId { get; init; }
}
