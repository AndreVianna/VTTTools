namespace VttTools.Contracts.Game;

using System.ComponentModel.DataAnnotations;
using VttTools.Model.Game;

/// <summary>
/// Request to update an existing Adventure template.
/// </summary>
public record UpdateAdventureRequest : Request
{
    /// <summary>
    /// New name for the adventure. If null, name is unchanged.
    /// </summary>
    public string? Name { get; init; }

    /// <summary>
    /// New visibility setting. If null, visibility is unchanged.
    /// </summary>
    public Visibility? Visibility { get; init; }
}