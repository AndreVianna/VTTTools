namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    internal class Handler {
        private IGameServiceClient _client = null!;

        internal async Task<PageState> InitializeAsync(IGameServiceClient client) {
            _client = client;
            var data = await _client.GetMeetingsAsync();
            return new() {
                Meetings = [.. data],
            };
        }

        internal async Task OpenCreateMeetingDialog(PageState state) {
            state.ShowCreateDialog = true;
            state.NewMeetingSubject = string.Empty;
            state.MeetingSubjectError = string.Empty;
            state.Adventures = [.. await _client.GetAdventuresAsync()];
            state.SelectedAdventureId = null;
            state.Episodes = [];
            state.SelectedEpisodeId = null;
            state.ShowEpisodeError = false;
        }

        internal static void CloseCreateMeetingDialog(PageState state)
            => state.ShowCreateDialog = false;

        internal async Task CreateMeeting(PageState state) {
            state.MeetingSubjectError = string.Empty;
            state.ShowEpisodeError = false;
            if (string.IsNullOrWhiteSpace(state.NewMeetingSubject)) {
                state.MeetingSubjectError = "Meeting name is required";
                return;
            }
            if (!state.SelectedEpisodeId.HasValue) {
                state.ShowEpisodeError = true;
                return;
            }

            try {
                var request = new CreateMeetingRequest {
                    Subject = state.NewMeetingSubject,
                    EpisodeId = state.SelectedEpisodeId.Value,
                };
                var result = await _client.CreateMeetingAsync(request);
                if (!result.IsSuccessful) {
                    state.MeetingSubjectError = result.Errors[0].Message;
                    return;
                }
                state.Meetings.Add(result.Value);
                state.MeetingSubjectError = string.Empty;
                state.ShowCreateDialog = false;
                state.NewMeetingSubject = string.Empty;
                state.SelectedEpisodeId = null;
            }
            catch (Exception ex) {
                state.MeetingSubjectError = $"Error creating meeting: {ex.Message}";
            }
        }

        internal async Task<bool> TryJoinMeeting(Guid meetingId) {
            try {
                await _client.JoinMeetingAsync(meetingId);
                return true;
            }
            catch (Exception ex) {
                await Console.Error.WriteLineAsync($"Error joining meeting: {ex.Message}");
                return false;
            }
        }

        internal async Task DeleteMeeting(PageState state, Guid meetingId) {
            if (!await DisplayConfirmation("Are you sure you want to delete this meeting?"))
                return;

            try {
                var meetingToRemove = state.Meetings.FirstOrDefault(s => s.Id == meetingId);
                if (meetingToRemove == null)
                    return;
                await _client.DeleteMeetingAsync(meetingId);
                state.Meetings.Remove(meetingToRemove);
            }
            catch (Exception ex) {
                // Handle error
                await Console.Error.WriteLineAsync($"Error deleting meeting: {ex.Message}");
            }
        }

        // Handle selection of an adventure: load its episodes
        internal async Task ReloadAdventureEpisodes(PageState state, object? value) {
            if (!Guid.TryParse(value?.ToString(), out var adventureId)) {
                state.SelectedAdventureId = null;
                return;
            }

            state.SelectedAdventureId = adventureId;
            var data = await _client.GetEpisodesAsync(adventureId);
            state.Episodes = [.. data!];
        }
    }
}