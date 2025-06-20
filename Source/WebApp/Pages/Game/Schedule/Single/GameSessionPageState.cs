namespace VttTools.WebApp.Pages.Game.Schedule.Single;

internal class GameSessionPageState {
    public GameSessionDetails GameSession { get; set; } = null!;
    public bool CanStart { get; set; }
    public bool CanEdit { get; set; }
    public bool ShowEditDialog { get; set; }
    public GameSessionPageInput Input { get; set; } = new();
}