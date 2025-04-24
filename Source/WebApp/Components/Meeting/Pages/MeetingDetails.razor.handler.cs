namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    internal class Handler {
        private IGameServiceClient _client = null!;
        private CurrentUser _currentUser = null!;

        internal void Initialize(CurrentUser currentUser, IGameServiceClient client, Guid meetingId, PageState state) {
            _currentUser = currentUser;
            _client = client;
            state.Id = meetingId;
        }

        internal async Task<bool> TryLoadMeetingDetails(PageState state) {
            try {
                state.Meeting = await _client.GetMeetingByIdAsync(state.Id);
                if (state.Meeting == null)
                    return false;
                state.IsGameMaster = state.Meeting.OwnerId == _currentUser.Id
                                  || state.Meeting.Players.Any(p => IsGameMaster(_currentUser.Id, p));
                return true;
            }
            catch (Exception ex) {
                await Console.Error.WriteLineAsync($"Error loading meeting: {ex.Message}");
                return false;
            }
        }

        private static bool IsGameMaster(Guid userId, MeetingPlayer player)

            => player.UserId == userId
            && player.Type == PlayerType.Master;

        internal static void OpenEditMeetingDialog(PageState state) {
            if (state.Meeting == null)
                return;

            state.EditMeetingSubject = state.Meeting.Subject;
            state.MeetingSubjectError = string.Empty;
            state.ShowEditDialog = true;
        }

        internal static void CloseEditMeetingDialog(PageState state)
            => state.ShowEditDialog = false;

        internal async Task UpdateMeeting(PageState state) {
            if (string.IsNullOrWhiteSpace(state.EditMeetingSubject)) {
                state.MeetingSubjectError = "Meeting name is required";
                return;
            }

            try {
                var request = new UpdateMeetingRequest {
                    Subject = state.EditMeetingSubject,
                };
                await _client.UpdateMeetingAsync(state.Id, request);
                await TryLoadMeetingDetails(state);
                state.ShowEditDialog = false;
            }
            catch (Exception ex) {
                state.MeetingSubjectError = $"Error updating meeting: {ex.Message}";
            }
        }

        internal async Task<bool> TryStartMeeting(PageState state) {
            try {
                await _client.StartMeetingAsync(state.Id);
                return true;
            }
            catch (Exception ex) {
                await Console.Error.WriteLineAsync($"Error starting meeting: {ex.Message}");
                return false;
            }
        }
    }
}