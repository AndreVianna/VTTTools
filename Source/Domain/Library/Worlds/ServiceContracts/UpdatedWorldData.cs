namespace VttTools.Library.Worlds.ServiceContracts;

/// <summary>
/// Represents the data for updating an existing world.
/// </summary>
public record UpdatedWorldData
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
            result += new Error("When set, the world name cannot be null or empty.", nameof(Name));
        if (Description.IsSet && string.IsNullOrWhiteSpace(Description.Value))
            result += new Error("When set, the world description cannot be null or empty.", nameof(Description));
        if (IsPublished is { IsSet: true, Value: true } && IsPublic is { IsSet: true, Value: false })
            result += new Error("A published world must be public.", nameof(IsPublic));
        if (IsPublic is { IsSet: true, Value: false } && IsPublished is { IsSet: true, Value: true })
            result += new Error("A published world must be public.", nameof(IsPublished));
        return result;
    }
}