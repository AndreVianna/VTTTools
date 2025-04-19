namespace VttTools.Contracts.Game;

/// <summary>
/// Request to create a new Adventure template.
/// </summary>
public record CreateAdventureRequest
    : CreateTemplateRequest<Adventure>;