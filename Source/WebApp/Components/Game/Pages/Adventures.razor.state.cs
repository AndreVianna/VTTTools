namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    internal class PageState {
        internal List<Adventure> Adventures { get; set; } = [];

        internal InputModel CreateInput { get; set; } = new();

        internal bool ShowEditDialog { get; set; }
        internal InputModel EditInput { get; set; } = new();
    }
}