namespace VttTools.Library.Epics.ServiceContracts;

/// <summary>
/// Represents the data for updating an existing epic.
/// </summary>
public record UpdatedEpicData
    : Data {
    public Guid Id { get; init; }
    public Optional<string> Name { get; init; }
    public Optional<string> Description { get; init; }
    public Optional<Guid?> BackgroundId { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }

    public override Result Validate(IMap? context = null) {
        var result = base.Validate(context);
        if (Name.IsSet && string.IsNullOrWhiteSpace(Name.Value))
            result += new Error("When set, the epic name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the epic description cannot be null or empty.", nameof(Description));
        if (IsPublished.IsSet && IsPublished.Value && IsPublic.IsSet && !IsPublic.Value)
            result += new Error("A published epic must be public.", nameof(IsPublic));
        if (IsPublic.IsSet && !IsPublic.Value && IsPublished.IsSet && IsPublished.Value)
            result += new Error("A published epic must be public.", nameof(IsPublished));
        return result;
    }
}
