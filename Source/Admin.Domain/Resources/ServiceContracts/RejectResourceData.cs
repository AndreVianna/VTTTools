namespace VttTools.Admin.Resources.ServiceContracts;

public sealed record RejectResourceData
    : Data {
    [Required]
    public required Guid ResourceId { get; init; }
}
