namespace VttTools.WebApp.Pages.GameSessions;

internal class GameSessionInputModel {
    public string Title { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}