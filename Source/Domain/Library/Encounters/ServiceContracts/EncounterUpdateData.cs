namespace VttTools.Library.Encounters.ServiceContracts;

public record EncounterUpdateData
    : Data {
    public Optional<Guid> AdventureId { get; init; }
    public Optional<string?> Name { get; init; }
    public Optional<string?> Description { get; init; }
    public Optional<bool> IsPublished { get; init; }
    public Optional<bool> IsPublic { get; init; }
}