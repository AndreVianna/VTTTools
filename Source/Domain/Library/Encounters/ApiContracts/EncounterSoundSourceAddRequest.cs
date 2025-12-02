
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSoundSourceAddRequest {
    [MaxLength(128)]
    public string? Name { get; init; }
    public Point Position { get; init; } = Point.Zero;
    public float Range { get; init; }
    public Guid? ResourceId { get; init; }
    public bool IsPlaying { get; init; }
}