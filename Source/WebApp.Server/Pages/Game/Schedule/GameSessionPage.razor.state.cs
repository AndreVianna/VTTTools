namespace VttTools.WebApp.Server.Pages.Game.Schedule;

internal class GameSessionPageState {
    public GameSession GameSession { get; set; } = null!;
    public bool CanStart { get; set; }
    public bool CanEdit { get; set; }
    public bool ShowEditDialog { get; set; }
    public GameSessionInputModel Input { get; set; } = new();
}