namespace VttTools.Library.Stages.Model;

public record StageSound {
    public ushort Index { get; init; }
    public string? Name { get; init; }
    public ResourceMetadata Media { get; init; } = null!;
    public Point Position { get; init; } = Point.Zero;
    public float Radius { get; init; } = 10.0f;
    public float Volume { get; init; } = 1.0f;
    public bool Loop { get; init; } = true;
    public bool IsPlaying { get; init; }
}
