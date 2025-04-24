namespace VttTools.Contracts.Game;

/// <inheritdoc />
public record CloneEpisodeRequest
    : CloneTemplateRequest<Episode> {
    /// <summary>
    /// The ID of the adventure to which this episode belongs.
    /// </summary>
    public Optional<Guid> AdventureId { get; init; }
}
