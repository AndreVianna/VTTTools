namespace VttTools.WebApp.Pages.Meeting;

public class MeetingDetailsPageHandler {
    private Guid _userId;
    private IGameService _service = null!;

    internal MeetingDetailsPageState State { get; } = new();

    public Task<bool> TryInitializeAsync(Guid meetingId, Guid userId, IGameService service) {
        _userId = userId;
        _service = service;
        return TryLoadMeetingDetails(meetingId);
    }

    private async Task<bool> TryLoadMeetingDetails(Guid meetingId) {
        var meeting = await _service.GetMeetingByIdAsync(meetingId);
        if (meeting == null)
            return false;
        State.Meeting = meeting;
        State.CanEdit = meeting.OwnerId == _userId;
        State.CanStart = meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
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
        State.CanEdit = State.Meeting.OwnerId == _userId;
        State.CanStart = State.Meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
        CloseEditMeetingDialog();
    }

    public Task<bool> TryStartMeeting()
        => _service.StartMeetingAsync(State.Meeting.Id);
}