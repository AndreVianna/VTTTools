namespace VttTools.WebApp.Pages.Game.Chat;

internal sealed class ChatPageInput {
    [Required(AllowEmptyStrings = false)]
    public string Message { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}