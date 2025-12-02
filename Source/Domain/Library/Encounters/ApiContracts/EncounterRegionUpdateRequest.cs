
namespace VttTools.Library.Encounters.ApiContracts;

public record EncounterRegionUpdateRequest {
    [MaxLength(128)]
    public Optional<string?> Name { get; init; }
    [MaxLength(32)]
    public Optional<RegionType> Type { get; init; }
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int> Value { get; init; }
}