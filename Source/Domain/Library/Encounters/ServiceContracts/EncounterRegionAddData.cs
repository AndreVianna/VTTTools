
namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterRegionAddData
    : Data {
    public string? Name { get; init; }
    public RegionType Type { get; init; }
    public required List<Point> Vertices { get; init; }
    public int Value { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (!string.IsNullOrWhiteSpace(Name) && Name.Length > 128)
            result += new Error("Name must not exceed 128 characters.", nameof(Type));
        return result;
    }
}