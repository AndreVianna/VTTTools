namespace VttTools.Library.Encounters.ServiceContracts;

public record CreateEncounterRequest
    : Request {
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? StageId { get; init; }
}