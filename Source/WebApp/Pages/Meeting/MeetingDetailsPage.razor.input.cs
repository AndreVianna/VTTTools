namespace VttTools.WebApp.Pages.Meeting;

internal class MeetingDetailsPageInputModel {
    public string Subject { get; set; } = string.Empty;
    public InputError[] Errors { get; set; } = [];
}