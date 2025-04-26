namespace VttTools.WebApp.Pages.Game;

public partial class AdventuresPage {
    internal class PageState {
        internal List<Adventure> Adventures { get; set; } = [];

        internal InputModel CreateInput { get; set; } = new();

        internal bool ShowEditDialog { get; set; }
        internal InputModel EditInput { get; set; } = new();
    }
}