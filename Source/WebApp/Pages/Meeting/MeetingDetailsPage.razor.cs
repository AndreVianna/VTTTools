namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingDetailsPage {
    [Parameter]
    public Guid MeetingId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal MeetingDetailsPageState State => Handler.State;
    internal MeetingDetailsPageInputModel Input => Handler.State.Input;

    protected override async Task ConfigureComponentAsync() {
        if (!await Handler.TryInitializeAsync(MeetingId, CurrentUser.Id, GameService))
            NavigateToMeetings();
    }

    internal void NavigateToMeetings()
        => RedirectTo("/meetings");

    internal void OpenEditMeetingDialog()
        => Handler.OpenEditMeetingDialog();

    private void CloseEditMeetingDialog()
        => Handler.CloseEditMeetingDialog();

    internal Task UpdateMeeting()
        => Handler.UpdateMeeting();

    internal async Task StartMeeting() {
        if (!await Handler.TryStartMeeting())
            return;
        RedirectTo($"/game/{State.Meeting.Id}");
    }
}