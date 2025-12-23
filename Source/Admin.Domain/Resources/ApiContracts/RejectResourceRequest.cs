namespace VttTools.Admin.Resources.ApiContracts;

public sealed record RejectResourceRequest
    : Request {
    public required Guid ResourceId { get; init; }
}
