namespace VttTools.WebApp.Pages.Game.Schedule;

internal class GameSessionInputModel {
    public string Title { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}