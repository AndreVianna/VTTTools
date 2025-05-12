namespace VttTools.WebApp.Pages.Game.Schedule;

internal class GameSessionsPageState {
    internal List<GameSession> GameSessions { get; set; } = [];

    internal bool IsCreating { get; set; }
    internal GameSessionsInputModel Input { get; set; } = new();
}