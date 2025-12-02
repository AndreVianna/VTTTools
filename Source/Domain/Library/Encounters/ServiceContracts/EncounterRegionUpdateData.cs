
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterRegionUpdateData
    : Data {
    public Optional<string> Type { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int> Value { get; init; }
}