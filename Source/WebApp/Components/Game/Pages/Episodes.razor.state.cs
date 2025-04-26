namespace VttTools.WebApp.Components.Game.Pages;

public partial class Episodes {
    internal class PageState {
        internal Guid AdventureId { get; set; }
        internal List<Episode> Episodes { get; set; } = [];

        internal InputModel CreateInput { get; set; } = new();

        internal bool ShowEditDialog { get; set; }
        internal InputModel EditInput { get; set; } = new();
    }
}