namespace VttTools.WebApp.Components.Game.Pages;

public partial class Episodes {
    internal class PageState {
        internal Guid AdventureId { get; set; }

        internal Episode[]? Episodes { get; set; }

        internal bool IsEditing { get; set; }

        internal Guid EditingEpisodeId { get; set; }

        internal InputModel Input { get; set; } = new();
    }
}