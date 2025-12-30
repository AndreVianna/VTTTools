namespace VttTools.Library.Encounters.ServiceContracts;

public record CreateEncounterData
    : Data {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? StageId { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The encounter description cannot be null or empty.", nameof(Description));
        return result;
    }
}