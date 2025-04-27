namespace VttTools.WebApp.Pages.Meeting;

internal class MeetingDetailsPageState {
    public MeetingModel Meeting { get; set; } = null!;
    public bool CanStart { get; set; }
    public bool CanEdit { get; set; }
    public bool ShowEditDialog { get; set; }
    public MeetingDetailsPageInputModel Input { get; set; } = new();
}