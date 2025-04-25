namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class Handler {
        private IGameService _service = null!;
        private Guid _userId;

        internal async Task<PageState?> InitializeState(Guid meetingId, Guid userId, IGameService service) {
            _service = service;
            _userId = userId;
            var state = new PageState(meetingId);
            return !await TryLoadMeetingDetails(state) ? null : state;
        }

        internal async Task<bool> TryLoadMeetingDetails(PageState state) {
            var meeting = await _service.GetMeetingByIdAsync(state.Id);
            if (meeting == null)
                return false;
            state.Meeting = meeting;
            state.CanEdit = meeting.OwnerId == _userId;
            state.CanStart = meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
            return true;
        }

        internal static void OpenEditMeetingDialog(PageState state) {
            state.Input = new() { Subject = state.Meeting.Subject };
            state.Errors = [];
            state.ShowEditDialog = true;
        }

        internal static void CloseEditMeetingDialog(PageState state)
            => state.ShowEditDialog = false;

        internal async Task UpdateMeeting(PageState state) {
            state.Errors = [];
            var request = new UpdateMeetingRequest {
                Subject = state.Input.Subject,
            };
            var result = await _service.UpdateMeetingAsync(state.Id, request);
            if (result.HasErrors) {
                state.Errors = [.. result.Errors];
                return;
            }

            state.Meeting = result.Value;
            state.CanEdit = state.Meeting.OwnerId == _userId;
            state.CanStart = state.Meeting.Players.FirstOrDefault(p => p.UserId == _userId)?.Type == PlayerType.Master;
            CloseEditMeetingDialog(state);
        }

        internal Task<bool> TryStartMeeting(PageState state)
            => _service.StartMeetingAsync(state.Id);
    }
}