namespace VttTools.WebApp.Pages.Meeting;

internal class MeetingsPageState {
    internal List<MeetingModel> Meetings { get; set; } = [];

    internal bool ShowCreateDialog { get; set; }
    internal MeetingsPageInputModel Input { get; set; } = new();
}