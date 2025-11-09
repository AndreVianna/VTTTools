namespace VttTools.Library.Epics.ApiContracts;

public record CreateEpicRequest
    : Request {
    [Required]
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [Required]
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundId { get; init; }
}
