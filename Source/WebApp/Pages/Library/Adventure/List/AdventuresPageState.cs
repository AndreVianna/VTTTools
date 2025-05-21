namespace VttTools.WebApp.Pages.Library.Adventure.List;

internal class AdventuresPageState {
    /// <summary>
    /// All adventures that the user has access to.
    /// </summary>
    internal List<AdventureListItem> Adventures { get; set; } = [];
    /// <summary>
    /// The current view mode for the adventures list.
    /// </summary>
    internal ListViewMode ListViewMode { get; set; } = ListViewMode.List;
    /// <summary>
    /// The current text search filter.
    /// </summary>
    internal string? SearchText { get; set; }
    /// <summary>
    /// The current type filter.
    /// </summary>
    internal AdventureType? FilterType { get; set; }

    internal ICollection<AdventureListItem> OwnedAdventures { get; set; } = [];
    internal ICollection<AdventureListItem> PublicAdventures { get; set; } = [];
}