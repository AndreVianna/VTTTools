namespace VttTools.Jobs.ApiContracts;

public sealed record UpdateJobRequest {
    public JobStatus Status { get; init; }
    public Optional<DateTime?> StartedAt { get; init; }
    public Optional<DateTime?> CompletedAt { get; init; }
    public List<Item> Items { get; init; } = [];

    public sealed record Item {
        public required int Index { get; init; }
        public JobItemStatus Status { get; init; }
        public Optional<string?> Message { get; init; }
        public Optional<DateTime?> StartedAt { get; init; }
        public Optional<DateTime?> CompletedAt { get; init; }
    }
}
