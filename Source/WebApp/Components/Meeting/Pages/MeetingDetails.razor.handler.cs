namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class Handler() {
        private readonly Guid _userId;
        private readonly IGameService _service = null!;

        internal PageState State { get; } = new();

        internal Handler(Guid meetingId, Guid userId, IGameService service)
            : this() {
            _userId = userId;
            _service = service;
            State.Id = meetingId;
        }

        internal static async Task<Handler?> InitializeAsync(Guid meetingId, Guid userId, IGameService service) {
            var handler = new Handler(meetingId, userId, service);
            return await handler.TryLoadMeetingDetails() ? handler : null;
        }

        internal async Task<bool> TryLoadMeetingDetails() {
            var meeting = await _service.GetMeetingByIdAsync(State.Id);
            if (meeting == null)
                return false;
            State.Meeting = meeting;
            State.CanEdit = meeting.OwnerId == _userId;
            State.CanStart = meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
            return true;
        }

        internal void OpenEditMeetingDialog() {
            State.Input = new() { Subject = State.Meeting.Subject };
            State.Errors = [];
            State.ShowEditDialog = true;
        }

        internal void CloseEditMeetingDialog()
            => State.ShowEditDialog = false;

        internal async Task UpdateMeeting() {
            State.Errors = [];
            var request = new UpdateMeetingRequest {
                Subject = State.Input.Subject,
            };
            var result = await _service.UpdateMeetingAsync(State.Id, request);
            if (result.HasErrors) {
                State.Errors = [.. result.Errors];
                return;
            }

            State.Meeting = result.Value;
            State.CanEdit = State.Meeting.OwnerId == _userId;
            State.CanStart = State.Meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
            CloseEditMeetingDialog();
        }

        internal Task<bool> TryStartMeeting()
            => _service.StartMeetingAsync(State.Id);
    }
}