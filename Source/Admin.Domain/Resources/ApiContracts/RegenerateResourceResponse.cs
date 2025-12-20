namespace VttTools.Admin.Resources.ApiContracts;

public sealed record RegenerateResourceResponse {
    public required Guid NewResourceId { get; init; }
}
