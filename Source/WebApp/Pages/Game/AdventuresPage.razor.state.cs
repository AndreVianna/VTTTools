namespace VttTools.WebApp.Pages.Game;

internal class AdventuresPageState {
    internal List<Adventure> Adventures { get; set; } = [];

    internal AdventuresPageInputModel CreateInput { get; set; } = new();

    internal bool ShowEditDialog { get; set; }
    internal AdventuresPageInputModel EditInput { get; set; } = new();
}