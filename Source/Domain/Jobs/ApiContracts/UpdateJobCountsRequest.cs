namespace VttTools.Jobs.ApiContracts;

public sealed record UpdateJobCountsRequest {
    public required int CompletedItems { get; init; }
    public required int FailedItems { get; init; }
}
