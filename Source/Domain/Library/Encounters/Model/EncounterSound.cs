
namespace VttTools.Library.Encounters.Model;

public record EncounterSound {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string? Name { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public float Range { get; init; }
    public ResourceMetadata? Resource { get; init; }
    public bool IsPlaying { get; init; }
    public bool Loop { get; init; }
}