namespace VttTools.Admin.Resources.ApiContracts;

public sealed record ResourceListResponse : Response {
    public required IReadOnlyList<ResourceInfoResponse> Items { get; init; }
    public required int TotalCount { get; init; }
    public required int Skip { get; init; }
    public required int Take { get; init; }
}
