using VttTools.Contracts.Game;

using MeetingModel = VttTools.Model.Game.Meeting;

namespace WebApp.Components.Meeting.Pages;

public partial class Meetings {
    private List<MeetingModel>? _meetings;
    private bool _showCreateDialog;
    private string _newMeetingName = string.Empty;
    private string _meetingNameError = string.Empty;
    private Guid _currentUserId;

    // Adventure and Episode selection for new meeting
    private List<Adventure>? _adventures;
    private bool _showEpisodeError;
    private Guid? _selectedAdventureId;
    private List<Episode>? _episodes;
    private Guid? _selectedEpisodeId;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private GameServiceClient GameApiClient { get; set; } = null!;
    [Inject]
    private AuthenticationStateProvider AuthStateProvider { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var principal = authState.User;

        if (principal.Identity?.IsAuthenticated == true) {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                _currentUserId = userId;
        }

        await LoadMeetings();
    }

    private async Task LoadMeetings() {
        try {
            _meetings = await GameApiClient.HttpClient
                                           .GetFromJsonAsync<List<VttTools.Model.Game.Meeting>>("/api/meetings");
        }
        catch (Exception ex) {
            _meetings = [new() {
                Id = Guid.NewGuid(),
                Name = ex.Message,
                OwnerId = _currentUserId,
                Players = [new() {
                    UserId = _currentUserId,
                    Type = PlayerType.Master,
                }],
            }];
        }
    }

    private async Task OpenCreateMeetingDialog() {
        _showCreateDialog = true;
        _newMeetingName = string.Empty;
        _meetingNameError = string.Empty;
        _selectedAdventureId = null;
        _showEpisodeError = false;
        _episodes = null;
        _selectedEpisodeId = null;
        // Load available adventures
        _adventures = await GameApiClient.HttpClient.GetFromJsonAsync<List<Adventure>>("/api/adventures");
    }

    private void CloseCreateMeetingDialog()
        => _showCreateDialog = false;

    private async Task CreateMeeting() {
        _meetingNameError = string.Empty;
        _showEpisodeError = false;
        if (string.IsNullOrWhiteSpace(_newMeetingName)) {
            _meetingNameError = "Meeting name is required";
            return;
        }
        if (!_selectedEpisodeId.HasValue) {
            _showEpisodeError = true;
            return;
        }

        try {
            var request = new CreateMeetingRequest {
                Name = _newMeetingName,
                EpisodeId = _selectedEpisodeId.Value,
            };
            var response = await GameApiClient.HttpClient.PostAsJsonAsync("/api/meetings", request);
            response.EnsureSuccessStatusCode();
            var meeting = await response.Content.ReadFromJsonAsync<MeetingModel>();
            _meetings ??= [];
            _meetings.Add(meeting!);
            _showCreateDialog = false;
        }
        catch (Exception ex) {
            _meetingNameError = $"Error creating meeting: {ex.Message}";
        }
    }

    private async Task JoinMeeting(Guid meetingId) {
        try {
            var response = await GameApiClient.HttpClient.PostAsync($"/api/meetings/{meetingId}/join", null);
            response.EnsureSuccessStatusCode();
            // Redirect to the game view once it's implemented
            // Navigation.NavigateTo($"/game/{MeetingId}");
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error joining meeting: {ex.Message}");
        }
    }

    private void ViewMeeting(Guid meetingId)
        => NavigationManager.NavigateTo($"/meeting/{meetingId}");

    private async Task DeleteMeeting(Guid meetingId) {
        if (!await DisplayConfirmation("Are you sure you want to delete this meeting?"))
            return;

        try {
            var meetingToRemove = _meetings?.FirstOrDefault(s => s.Id == meetingId);
            if (meetingToRemove == null)
                return;
            var response = await GameApiClient.HttpClient.DeleteAsync($"/api/meetings/{meetingId}");
            response.EnsureSuccessStatusCode();
            _meetings?.Remove(meetingToRemove);
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error deleting meeting: {ex.Message}");
        }
    }

    // Handle selection of an adventure: load its episodes
    private async Task OnAdventureChanged(ChangeEventArgs e) {
        var value = e.Value?.ToString();
        if (Guid.TryParse(value, out var advId)) {
            _selectedAdventureId = advId;
            // Fetch episodes for selected adventure
            _episodes = await GameApiClient.HttpClient
                       .GetFromJsonAsync<List<Episode>>($"/api/adventures/{advId}/episodes");
        }
        else {
            _selectedAdventureId = null;
            _episodes = null;
        }
    }

    // In a real application, you would use a dialog service instead
    private static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}
