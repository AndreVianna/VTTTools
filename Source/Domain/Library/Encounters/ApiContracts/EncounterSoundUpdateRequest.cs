
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSoundUpdateRequest {
    [MaxLength(128)]
    public Optional<string?> Name { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<Guid?> ResourceId { get; init; }
    public Optional<bool> IsPlaying { get; init; }
    public Optional<bool> Loop { get; init; }
}