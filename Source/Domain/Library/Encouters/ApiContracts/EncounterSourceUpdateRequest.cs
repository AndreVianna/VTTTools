
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterSourceUpdateRequest {
    [MaxLength(128)]
    public Optional<string> Name { get; init; } = string.Empty;
    [MaxLength(32)]
    public Optional<string> Type { get; init; } = string.Empty;
    public Optional<Point> Position { get; init; }
    public Optional<bool> IsDirectional { get; init; }
    public Optional<float> Direction { get; init; }
    public Optional<float> Range { get; init; }
    public Optional<float> Spread { get; init; }
    public Optional<float> Intensity { get; init; }
    public Optional<string?> Color { get; init; }
    public Optional<bool> HasGradient { get; init; }
}