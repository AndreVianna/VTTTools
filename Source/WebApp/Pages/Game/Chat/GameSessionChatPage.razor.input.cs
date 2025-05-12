namespace VttTools.WebApp.Pages.Game.Chat;

internal sealed class GameSessionChatInputModel {
    [Required(AllowEmptyStrings = false)]
    public string Message { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}