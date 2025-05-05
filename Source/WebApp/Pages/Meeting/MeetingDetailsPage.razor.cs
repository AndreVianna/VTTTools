namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingDetailsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    [Parameter]
    public Guid MeetingId { get; set; }

    internal MeetingDetailsPageState State => Handler.State;
    internal MeetingDetailsPageInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureComponentAsync() {
        if (await Handler.TryConfigureAsync(GameService, MeetingId))
            return true;

        NavigateToMeetings();
        return false;
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