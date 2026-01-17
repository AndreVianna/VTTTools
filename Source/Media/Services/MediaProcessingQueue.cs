using System.Threading.Channels;

namespace VttTools.Media.Services;

[SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix", Justification = "This class handles a channel as a queue.")]
public sealed class MediaProcessingQueue {
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions {
        SingleReader = true,
        SingleWriter = false,
    });

    public ValueTask EnqueueAsync(Guid resourceId, CancellationToken ct = default)
        => _channel.Writer.WriteAsync(resourceId, ct);

    public IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);
}
