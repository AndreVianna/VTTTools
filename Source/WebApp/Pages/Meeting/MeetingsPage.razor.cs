namespace VttTools.WebApp.Pages.Meeting;

public partial class MeetingsPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal MeetingsPageState State => Handler.State;
    internal MeetingsPageInputModel Input => Handler.State.Input;

    protected override Task ConfigureComponentAsync()
        => Handler.InitializeAsync(GameService);

    internal void NavigateToMeeting(Guid meetingId)
        => RedirectTo($"/meeting/{meetingId}");

    internal Task ShowCreateDialog()
        => Handler.StartMeetingCreating();

    internal void HideCreateDialog()
        => Handler.EndMeetingCreating();

    internal Task CreateMeeting()
        => Handler.SaveCreatedMeeting();

    internal Task DeleteMeeting(Guid meetingId)
        => Handler.DeleteMeeting(meetingId);

    internal async Task JoinMeeting(Guid meetingId) {
        if (!await Handler.TryJoinMeeting(meetingId))
            return;
        RedirectTo($"/game/{meetingId}");
    }

    internal Task OnAdventureChanged(ChangeEventArgs e)
        => Handler.LoadEpisodes((Guid)e.Value!);

    internal static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}