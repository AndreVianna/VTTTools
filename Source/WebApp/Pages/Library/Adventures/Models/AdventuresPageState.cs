namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal class AdventuresPageState {
    /// <summary>
    /// The display mode for the adventures list.
    /// </summary>
    internal enum ViewMode {
        List,
        Card,
    }

    /// <summary>
    /// All adventures that the user has access to.
    /// </summary>
    internal List<AdventureListItem> Adventures { get; set; } = [];

    /// <summary>
    /// Adventures owned by the current user.
    /// </summary>
    internal List<AdventureListItem> OwnedAdventures { get; set; } = [];

    /// <summary>
    /// Public adventures created by other users.
    /// </summary>
    internal List<AdventureListItem> PublicAdventures { get; set; } = [];

    /// <summary>
    /// The current view mode for the adventures list.
    /// </summary>
    internal ViewMode CurrentViewMode { get; set; } = ViewMode.List;

    /// <summary>
    /// The current text search filter.
    /// </summary>
    internal string? SearchText { get; set; }

    /// <summary>
    /// The current type filter.
    /// </summary>
    internal AdventureType? FilterType { get; set; }

    /// <summary>
    /// The input model for creating a new adventure.
    /// </summary>
    internal AdventureInputModel CreateInput { get; set; } = new();

    /// <summary>
    /// Whether an adventure is currently being edited.
    /// </summary>
    internal bool IsEditing { get; set; }

    /// <summary>
    /// The input model for editing an existing adventure.
    /// </summary>
    internal AdventureInputModel EditInput { get; set; } = new();
}