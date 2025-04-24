namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    internal class PageState {
        internal Adventure[]? Adventures { get; set; }

        internal bool IsEditing { get; set; }

        internal Guid EditingAdventureId { get; set; }

        internal InputModel Input { get; set; } = new();
    }
}