
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSoundSourceResponse {
    public uint Index { get; init; }
    public string? Name { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public float Range { get; init; }
    public Guid? ResourceId { get; init; }
    public bool IsPlaying { get; init; }
}