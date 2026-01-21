namespace VttTools.Jobs.ServiceContracts;

public sealed record AddJobData
    : Data {
    public required Guid OwnerId { get; init; }
    public required string Type { get; init; }
    public List<Item> Items { get; init; } = [];

    public sealed record Item {
        public required int Index { get; init; }
        public required string Data { get; init; }
    }
}