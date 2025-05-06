namespace VttTools.Contracts.Game;

public record AddClonedEpisodeRequest
    : CloneTemplateRequest<Episode> {
    public Guid Id { get; init; }
}
