namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    private readonly Handler _handler = new();

    [Parameter]
    public Guid MeetingId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal PageState? State { get; set; }

    protected override async Task OnParametersSetAsync() {
        State = await _handler.InitializeState(MeetingId, CurrentUser.Id, GameService);
        if (State is null)
            NavigateToMeetings();
    }

    internal void NavigateToMeetings()
        => NavigateTo("/meetings");

    internal void OpenEditMeetingDialog()
        => Handler.OpenEditMeetingDialog(State!);

    private void CloseEditMeetingDialog()
        => Handler.CloseEditMeetingDialog(State!);

    internal Task UpdateMeeting()
        => _handler.UpdateMeeting(State!);

    internal async Task StartMeeting() {
        if (!await _handler.TryStartMeeting(State!))
            return;
        NavigateTo($"/game/{State!.Id}");
    }
}