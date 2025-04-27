namespace VttTools.WebApp.Pages.Meeting;

public sealed class MeetingsPageHandler() {
    private IGameService _service = null!;

    internal MeetingsPageHandler(IGameService service)
        : this() {
        _service = service;
    }

    internal MeetingsPageState State { get; } = new();

    public async Task InitializeAsync(IGameService service) {
        _service = service;
        var data = await service.GetMeetingsAsync();
        State.Meetings = [.. data];
    }

    public async Task OpenCreateMeetingDialog() {
        var adventures = await _service.GetAdventuresAsync();
        State.Input = new() {
                                Adventures = [.. adventures],
                                AdventureId = adventures.FirstOrDefault()?.Id ?? Guid.Empty,
                            };
        await LoadEpisodes(State.Input.AdventureId);
        State.ShowCreateDialog = true;
    }

    public void CloseCreateMeetingDialog()
        => State.ShowCreateDialog = false;

    public async Task CreateMeeting() {
        var request = new CreateMeetingRequest {
                                                   Subject = State.Input.Subject,
                                                   EpisodeId = State.Input.EpisodeId,
                                               };
        var result = await _service.CreateMeetingAsync(request);
        if (!result.IsSuccessful) {
            State.Input.Errors = [.. result.Errors];
            return;
        }
        State.ShowCreateDialog = false;
        State.Meetings.Add(result.Value);
    }

    public Task<bool> TryJoinMeeting(Guid meetingId)
        => _service.JoinMeetingAsync(meetingId);

    public async Task DeleteMeeting(Guid meetingId) {
        if (!await MeetingsPage.DisplayConfirmation("Are you sure you want to delete this meeting?"))
            return;

        var meetingToRemove = State.Meetings.FirstOrDefault(s => s.Id == meetingId);
        if (meetingToRemove == null)
            return;
        await _service.DeleteMeetingAsync(meetingId);
        State.Meetings.Remove(meetingToRemove);
    }

    // Handle selection of an adventure: load its episodes
    public async Task LoadEpisodes(Guid adventureId) {
        State.Input.Episodes = [];
        State.Input.EpisodeId = Guid.Empty;
        if (adventureId == Guid.Empty)
            return;
        var episodes = await _service.GetEpisodesAsync(adventureId);
        State.Input.Episodes = [.. episodes];
        State.Input.EpisodeId = episodes.FirstOrDefault()?.Id ?? Guid.Empty;
    }
}