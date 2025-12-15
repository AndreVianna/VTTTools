namespace VttTools.Jobs.ApiContracts;

public sealed record AddJobRequest {
    public Guid? OwnerId { get; init; }
    public required string Type { get; init; }
    public TimeSpan EstimatedDuration { get; init; }
    public List<Item> Items { get; init; } = [];

    public sealed record Item {
        public required int Index { get; init; }
        public required string Data { get; init; }
    }
}