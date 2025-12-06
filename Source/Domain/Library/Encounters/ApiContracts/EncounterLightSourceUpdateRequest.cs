
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterLightSourceUpdateRequest {
    [MaxLength(128)]
    public Optional<string?> Name { get; init; }
    public Optional<LightSourceType> Type { get; init; }
    public Optional<Point> Position { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<float?> Direction { get; init; }
    public Optional<float?> Arc { get; init; }
    public Optional<string?> Color { get; init; }
    public Optional<bool> IsOn { get; init; }
}