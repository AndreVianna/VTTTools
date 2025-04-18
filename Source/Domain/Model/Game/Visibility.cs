namespace VttTools.Model.Game;

/// <summary>
/// Visibility settings for templates and instances.
/// </summary>
public enum Visibility
{
    /// <summary>
    /// Only the owner and administrators can see this item.
    /// </summary>
    Hidden = 0,
    /// <summary>
    /// Owner, participants, and administrators can see this item, but only owner/admin can include it in a meeting.
    /// </summary>
    Private = 1,
    /// <summary>
    /// All users can see and use this item; only owner/admin can edit.
    /// </summary>
    Public = 2,
}