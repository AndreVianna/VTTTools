
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterRegionUpdateData
    : Data {
    public Optional<RegionType> Type { get; init; }
    public Optional<string?> Name { get; init; }
    public Optional<List<Point>> Vertices { get; init; }
    public Optional<int> Value { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && !string.IsNullOrWhiteSpace(Name.Value) && Name.Value.Length > 128)
            result += new Error("Name must not exceed 128 characters.", nameof(Type));
        return result;
    }
}