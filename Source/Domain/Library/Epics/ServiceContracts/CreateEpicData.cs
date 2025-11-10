namespace VttTools.Library.Epics.ServiceContracts;

/// <summary>
/// Represents the data required to create a new epic.
/// </summary>
public record CreateEpicData
    : Data {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundId { get; init; }
    public bool IsPublished { get; init; }
    public bool IsPublic { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (string.IsNullOrWhiteSpace(Name))
            result += new Error("The epic name cannot be null or empty.", nameof(Name));
        if (string.IsNullOrWhiteSpace(Description))
            result += new Error("The epic description cannot be null or empty.", nameof(Description));
        if (IsPublished && !IsPublic)
            result += new Error("A published epic must be public.", nameof(IsPublic));
        return result;
    }
}
