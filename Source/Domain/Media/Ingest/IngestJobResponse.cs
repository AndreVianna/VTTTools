namespace VttTools.Media.Ingest;

/// <summary>
/// Response from starting an ingest job.
/// </summary>
public sealed record IngestJobResponse : Response {
    /// <summary>
    /// The created job ID.
    /// </summary>
    public required Guid JobId { get; init; }

    /// <summary>
    /// Number of items in the job.
    /// </summary>
    public required int ItemCount { get; init; }

    /// <summary>
    /// Asset IDs included in the job.
    /// </summary>
    public required IReadOnlyList<Guid> AssetIds { get; init; }
}
