namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    private Handler _handler = null!;

    [Parameter]
    public Guid MeetingId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override async Task OnParametersSetAsync() {
        await base.OnInitializedAsync();
        var handler = await Handler.InitializeAsync(MeetingId, CurrentUser.Id, GameService);
        if (handler is null) {
            NavigateToMeetings();
            return;
        }
        _handler = handler;
        IsLoading = false;
    }

    internal void NavigateToMeetings()
        => NavigateTo("/meetings");

    internal void OpenEditMeetingDialog()
        => _handler.OpenEditMeetingDialog();

    private void CloseEditMeetingDialog()
        => _handler.CloseEditMeetingDialog();

    internal Task UpdateMeeting()
        => _handler.UpdateMeeting();

    internal async Task StartMeeting() {
        if (!await _handler.TryStartMeeting())
            return;
        NavigateTo($"/game/{State.Id}");
    }
}