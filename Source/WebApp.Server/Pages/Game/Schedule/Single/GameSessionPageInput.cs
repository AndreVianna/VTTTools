namespace VttTools.WebApp.Server.Pages.Game.Schedule.Single;

internal class GameSessionPageInput {
    public string Title { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}