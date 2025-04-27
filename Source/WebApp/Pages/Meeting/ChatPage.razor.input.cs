namespace VttTools.WebApp.Pages.Meeting;

internal sealed class ChatPageInputModel {
    [Required(AllowEmptyStrings = false)]
    public string Message { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}