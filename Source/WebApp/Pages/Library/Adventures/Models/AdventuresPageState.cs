namespace VttTools.WebApp.Pages.Library.Adventures.Models;

internal class AdventuresPageState {
    internal List<AdventureListItem> Adventures { get; set; } = [];

    internal AdventureInputModel CreateInput { get; set; } = new();

    internal bool IsEditing { get; set; }
    internal AdventureInputModel EditInput { get; set; } = new();
}