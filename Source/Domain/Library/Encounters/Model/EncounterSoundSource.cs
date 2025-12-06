
namespace VttTools.Library.Encounters.Model;

public record EncounterSoundSource {
    public uint Index { get; init; }
    [MaxLength(128)]
    public string? Name { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public float Range { get; init; }
    public ResourceInfo? Resource { get; init; }
    public bool IsPlaying { get; init; }
}