namespace VttTools.Jobs.ServiceContracts;

public sealed record UpdateJobData
    : Data {
    public Guid Id { get; init; }
    public JobStatus Status { get; init; }
    public Optional<DateTime?> StartedAt { get; init; }
    public Optional<DateTime?> CompletedAt { get; init; }
    public List<Item> Items { get; init; } = [];

    public sealed record Item {
        public required int Index { get; init; }
        public JobItemStatus Status { get; init; }
        public Optional<string?> Result { get; init; }
        public Optional<DateTime?> StartedAt { get; init; }
        public Optional<DateTime?> CompletedAt { get; init; }
    }
}