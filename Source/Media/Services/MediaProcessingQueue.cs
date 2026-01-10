using System.Threading.Channels;

namespace VttTools.Media.Services;

public sealed class MediaProcessingQueue {
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(new UnboundedChannelOptions {
        SingleReader = true,
        SingleWriter = false,
    });

    public ValueTask EnqueueAsync(Guid resourceId, CancellationToken ct = default) =>
        _channel.Writer.WriteAsync(resourceId, ct);

    public IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}
