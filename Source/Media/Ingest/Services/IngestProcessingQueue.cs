using System.Threading.Channels;

namespace VttTools.Media.Ingest.Services;

/// <summary>
/// Queue item for ingest processing.
/// </summary>
public sealed record IngestQueueItem {
    /// <summary>
    /// The job ID for tracking.
    /// </summary>
    public required Guid JobId { get; init; }

    /// <summary>
    /// The owner ID for the resources.
    /// </summary>
    public required Guid OwnerId { get; init; }
}

/// <summary>
/// Queue for managing ingest job processing.
/// </summary>
[SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix", Justification = "This class handles a channel as a queue.")]
public sealed class IngestProcessingQueue {
    private readonly Channel<IngestQueueItem> _channel = Channel.CreateUnbounded<IngestQueueItem>(new UnboundedChannelOptions {
        SingleReader = true,
        SingleWriter = false,
    });

    /// <summary>
    /// Enqueue a job for processing.
    /// </summary>
    public ValueTask EnqueueAsync(IngestQueueItem item, CancellationToken ct = default)
        => _channel.Writer.WriteAsync(item, ct);

    /// <summary>
    /// Dequeue all items as an async enumerable.
    /// </summary>
    public IAsyncEnumerable<IngestQueueItem> DequeueAllAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
