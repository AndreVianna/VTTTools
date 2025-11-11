namespace VttTools.Library.Worlds.ApiContracts;

public record CreateWorldRequest
    : Request {
    [Required]
    [MaxLength(128)]
    public string Name { get; init; } = string.Empty;
    [Required]
    [MaxLength(4096)]
    public string Description { get; init; } = string.Empty;
    public Guid? BackgroundId { get; init; }
}
