namespace VttTools.WebApp.Pages.Game;

internal class EpisodesPageState {
    internal Guid AdventureId { get; set; }
    internal List<Episode> Episodes { get; set; } = [];

    internal EpisodesPageInputModel CreateInput { get; set; } = new();

    internal bool ShowEditDialog { get; set; }
    internal EpisodesPageInputModel EditInput { get; set; } = new();
}