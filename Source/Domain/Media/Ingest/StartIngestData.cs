namespace VttTools.Media.Ingest;

/// <summary>
/// Input data for starting an ingest job.
/// </summary>
public sealed record StartIngestData {
    /// <summary>
    /// The owner ID for the generated resources.
    /// </summary>
    public required Guid OwnerId { get; init; }

    /// <summary>
    /// Items to process in the ingest job.
    /// </summary>
    public required IReadOnlyList<IngestItemData> Items { get; init; }
}
