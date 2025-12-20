namespace VttTools.Admin.Resources.ApiContracts;

public sealed record RejectResourceRequest
    : Request {
    [Required]
    public required Guid ResourceId { get; init; }
}
