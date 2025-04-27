namespace VttTools.Contracts.Game;

/// <inheritdoc />
public record CreateEpisodeRequest
    : CreateTemplateRequest<Episode> {
    /// <summary>
    /// The ID of the adventure to which this episode belongs.
    /// </summary>
    public required Guid AdventureId { get; init; }
}