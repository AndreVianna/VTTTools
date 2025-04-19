namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Episode template.
/// </summary>
public record CreateEpisodeRequest
    : CreateTemplateRequest<Episode>;