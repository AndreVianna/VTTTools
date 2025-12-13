namespace VttTools.Jobs.ApiContracts;

public sealed record CreateJobItemRequest {
    public required int Index { get; init; }
    public required string InputJson { get; init; }
}
