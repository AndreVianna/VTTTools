namespace VttTools.WebApp.Pages.Meeting;

public class MeetingDetailsPageHandler(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory loggerFactory)
    : PrivateComponentHandler<MeetingDetailsPageHandler>(httpContext, navigationManager, user, loggerFactory) {
    private IGameService _service = null!;

    internal MeetingDetailsPageState State { get; } = new();

    public Task<bool> TryConfigureAsync(IGameService service, Guid meetingId) {
        _service = service;
        return TryLoadMeetingDetails(meetingId);
    }

    private async Task<bool> TryLoadMeetingDetails(Guid meetingId) {
        var meeting = await _service.GetMeetingByIdAsync(meetingId);
        if (meeting == null)
            return false;
        State.Meeting = meeting;
        State.CanEdit = meeting.OwnerId == CurrentUser.Id;
        State.CanStart = meeting.Players.FirstOrDefault(p => p.UserId == CurrentUser.Id)?.Type == PlayerType.Master;
        return true;
    }

    public void OpenEditMeetingDialog() {
        State.Input = new() { Subject = State.Meeting.Subject };
        State.ShowEditDialog = true;
    }

    public void CloseEditMeetingDialog()
        => State.ShowEditDialog = false;

    public async Task UpdateMeeting() {
        var request = new UpdateMeetingRequest {
            Subject = State.Input.Subject,
        };
        var result = await _service.UpdateMeetingAsync(State.Meeting.Id, request);
        if (result.HasErrors) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.Meeting = result.Value;
        State.CanEdit = State.Meeting.OwnerId == CurrentUser.Id;
        State.CanStart = State.Meeting.Players.FirstOrDefault(p => p.UserId == CurrentUser.Id)?.Type == PlayerType.Master;
        CloseEditMeetingDialog();
    }

    public Task<bool> TryStartMeeting()
        => _service.StartMeetingAsync(State.Meeting.Id);
}