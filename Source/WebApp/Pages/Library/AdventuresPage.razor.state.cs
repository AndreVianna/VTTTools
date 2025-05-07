namespace VttTools.WebApp.Pages.Library;

internal class AdventuresPageState {
    internal List<Adventure> Adventures { get; set; } = [];

    internal AdventuresInputModel CreateInput { get; set; } = new();

    internal bool IsEditing { get; set; }
    internal AdventuresInputModel EditInput { get; set; } = new();
}