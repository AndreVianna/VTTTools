namespace VttTools.Library.Stages.Model;

public record StageElement {
    public ushort Index { get; init; }
    public string? Name { get; init; }
    public ResourceMetadata Display { get; init; } = null!;
    public Dimension Size { get; init; } = Dimension.Zero;
    public Position Position { get; init; } = Position.Zero;
    public float Rotation { get; init; }
    public float Elevation { get; init; }
    public float Opacity { get; init; } = 1.0f;
}
