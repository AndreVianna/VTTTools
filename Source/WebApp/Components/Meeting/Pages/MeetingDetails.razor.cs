using MeetingModel = VttTools.Model.Game.Meeting;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails() {
    private readonly Handler _handler = new();

    internal MeetingDetails(Guid meetingId)
        : this() {
        MeetingId = meetingId;
    }

    [Parameter]
    public Guid MeetingId { get; set; }

    [Inject]
    internal IGameServiceClient GameServiceClient { get; set; } = null!;

    internal PageState State { get; set; } = new();

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _handler.Initialize(CurrentUser, GameServiceClient, MeetingId, State);
        await OnParametersSetAsync();
    }

    protected override async Task OnParametersSetAsync() {
        if (!await _handler.TryLoadMeetingDetails(State))
            NavigateToMeetings();
    }

    internal void NavigateToMeetings()
        => NavigateTo("/meetings");

    internal void OpenEditMeetingDialog()
        => Handler.OpenEditMeetingDialog(State);

    private void CloseEditMeetingDialog()
        => Handler.CloseEditMeetingDialog(State);

    internal Task UpdateMeeting()
        => _handler.UpdateMeeting(State);

    internal async Task StartMeeting() {
        if (!await _handler.TryStartMeeting(State))
            return;
        NavigateTo($"/game/{State.Id}");
    }
}