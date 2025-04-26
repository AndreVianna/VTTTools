namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingsPage {
    private Handler _handler = new();

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _handler = await Handler.InitializeAsync(GameService);
        IsLoading = false;
    }
    internal void NavigateToMeeting(Guid meetingId)
        => NavigateTo($"/meeting/{meetingId}");

    internal Task OpenCreateMeetingDialog()
        => _handler.OpenCreateMeetingDialog();
    internal void CloseCreateMeetingDialog()
        => _handler.CloseCreateMeetingDialog();

    internal Task CreateMeeting()
        => _handler.CreateMeeting();

    internal Task DeleteMeeting(Guid meetingId)
        => _handler.DeleteMeeting(meetingId);

    internal async Task JoinMeeting(Guid meetingId) {
        if (!await _handler.TryJoinMeeting(meetingId))
            return;
        NavigateTo($"/game/{meetingId}");
    }

    // Handle selection of an adventure: load its episodes
    internal Task OnAdventureChanged(ChangeEventArgs e)
        => _handler.LoadEpisodes((Guid)e.Value!);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}