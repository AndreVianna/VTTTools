namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Meetings {
    internal class Handler() {
        private readonly IGameService _service = null!;

        internal PageState State { get; } = new();

        internal Handler(IGameService service)
            : this() {
            _service = service;
        }

        internal static async Task<Handler> InitializeAsync(IGameService service) {
            var handler = new Handler(service);
            var data = await service.GetMeetingsAsync();
            handler.State.Meetings = [.. data];
            return handler;
        }

        internal async Task OpenCreateMeetingDialog() {
            State.ShowCreateDialog = true;
            State.NewMeetingSubject = string.Empty;
            State.MeetingSubjectError = string.Empty;
            State.Adventures = [.. await _service.GetAdventuresAsync()];
            State.SelectedAdventureId = null;
            State.Episodes = [];
            State.SelectedEpisodeId = null;
            State.ShowEpisodeError = false;
        }

        internal void CloseCreateMeetingDialog()
            => State.ShowCreateDialog = false;

        internal async Task CreateMeeting() {
            State.MeetingSubjectError = string.Empty;
            State.ShowEpisodeError = false;
            if (string.IsNullOrWhiteSpace(State.NewMeetingSubject)) {
                State.MeetingSubjectError = "Meeting name is required";
                return;
            }
            if (!State.SelectedEpisodeId.HasValue) {
                State.ShowEpisodeError = true;
                return;
            }

            var request = new CreateMeetingRequest {
                Subject = State.NewMeetingSubject,
                EpisodeId = State.SelectedEpisodeId.Value,
            };
            var result = await _service.CreateMeetingAsync(request);
            if (!result.IsSuccessful) {
                State.MeetingSubjectError = result.Errors[0].Message;
                return;
            }
            State.Meetings.Add(result.Value);
            State.MeetingSubjectError = string.Empty;
            State.ShowCreateDialog = false;
            State.NewMeetingSubject = string.Empty;
            State.SelectedEpisodeId = null;
        }

        internal Task<bool> TryJoinMeeting(Guid meetingId)
            => _service.JoinMeetingAsync(meetingId);

        internal async Task DeleteMeeting(Guid meetingId) {
            if (!await DisplayConfirmation("Are you sure you want to delete this meeting?"))
                return;

            var meetingToRemove = State.Meetings.FirstOrDefault(s => s.Id == meetingId);
            if (meetingToRemove == null)
                return;
            await _service.DeleteMeetingAsync(meetingId);
            State.Meetings.Remove(meetingToRemove);
        }

        // Handle selection of an adventure: load its episodes
        internal async Task ReloadAdventureEpisodes(Guid? adventureId) {
            if (!adventureId.HasValue) {
                State.SelectedAdventureId = null;
                return;
            }

            State.SelectedAdventureId = adventureId;
            var data = await _service.GetEpisodesAsync(adventureId.Value);
            State.Episodes = [.. data];
        }
    }
}