namespace VttTools.Common.Model;

public record Shape {
    public MediaType Type { get; init; }
    public Guid? SourceId { get; init; }
    public Vector2 Size { get; init; }
}
