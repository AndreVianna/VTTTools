namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    private readonly Handler _handler = new();

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal PageState? State { get; set; }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        State = await _handler.InitializeAsync(GameService);
    }
    internal void NavigateToMeeting(Guid meetingId)
        => NavigateTo($"/meeting/{meetingId}");

    internal Task OpenCreateMeetingDialog()
        => _handler.OpenCreateMeetingDialog(State!);
    internal void CloseCreateMeetingDialog()
        => Handler.CloseCreateMeetingDialog(State!);

    internal Task CreateMeeting()
        => _handler.CreateMeeting(State!);

    internal Task DeleteMeeting(Guid meetingId)
        => _handler.DeleteMeeting(State!, meetingId);

    internal async Task JoinMeeting(Guid meetingId) {
        if (!await _handler.TryJoinMeeting(meetingId))
            return;
        NavigateTo($"/game/{meetingId}");
    }

    // Handle selection of an adventure: load its episodes
    internal Task OnAdventureChanged(ChangeEventArgs e)
        => _handler.ReloadAdventureEpisodes(State!, (Guid?)e.Value);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}