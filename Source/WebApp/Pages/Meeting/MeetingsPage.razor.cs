namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal MeetingsPageState State => Handler.State;
    internal MeetingsPageInputModel Input => Handler.State.Input;

    protected override async Task OnParametersSetAsync() {
        await Handler.InitializeAsync(GameService);
        await base.OnParametersSetAsync();
    }

    internal void NavigateToMeeting(Guid meetingId)
        => NavigateTo($"/meeting/{meetingId}");

    internal Task OpenCreateMeetingDialog()
        => Handler.OpenCreateMeetingDialog();
    internal void CloseCreateMeetingDialog()
        => Handler.CloseCreateMeetingDialog();

    internal Task CreateMeeting()
        => Handler.CreateMeeting();

    internal Task DeleteMeeting(Guid meetingId)
        => Handler.DeleteMeeting(meetingId);

    internal async Task JoinMeeting(Guid meetingId) {
        if (!await Handler.TryJoinMeeting(meetingId))
            return;
        NavigateTo($"/game/{meetingId}");
    }

    internal Task OnAdventureChanged(ChangeEventArgs e)
        => Handler.LoadEpisodes((Guid)e.Value!);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}