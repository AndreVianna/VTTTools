
namespace VttTools.Library.Scenes.ApiContracts;

public record SceneSourceAddRequest {
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public Point Position { get; init; } = Point.Zero;
    public float Direction { get; init; }
    public float? Range { get; init; }
    public float? Intensity { get; init; }
    public bool HasGradient { get; init; }
}