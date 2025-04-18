namespace WebApp.Components.Meeting.Pages;

public partial class MeetingDetails {
    [Parameter]
    public Guid MeetingId { get; set; }

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private GameServiceClient GameApiClient { get; set; } = null!;
    [Inject]
    private AuthenticationStateProvider AuthStateProvider { get; set; } = null!;

    private VttTools.Model.Game.Meeting? _meeting;
    private Guid _currentUserId;
    private bool _isGameMaster;
    private bool _showEditDialog;
    private string _editMeetingName = string.Empty;
    private string _meetingNameError = string.Empty;

    protected override async Task OnInitializedAsync() {
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;

        if (user.Identity?.IsAuthenticated == true) {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                _currentUserId = userId;
        }

        await LoadMeetingDetails();
    }

    protected override Task OnParametersSetAsync() => LoadMeetingDetails();

    private async Task LoadMeetingDetails() {
        try {
            var response = await GameApiClient.HttpClient.GetAsync($"/api/meetings/{MeetingId}");
            response.EnsureSuccessStatusCode();
            _meeting = await response.Content.ReadFromJsonAsync<VttTools.Model.Game.Meeting>();
            if (_meeting == null)
                return;
            _isGameMaster = _meeting.OwnerId == _currentUserId ||
                            _meeting.Players.Any(p => p.UserId == _currentUserId && p.Type == PlayerType.Master);
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error loading meeting: {ex.Message}");
            NavigationManager.NavigateTo("/meetings");
        }
    }

    private void NavigateToMeetings() => NavigationManager.NavigateTo("/meetings");

    private void OpenEditMeetingDialog() {
        if (_meeting == null)
            return;

        _editMeetingName = _meeting.Name;
        _meetingNameError = string.Empty;
        _showEditDialog = true;
    }

    private void CloseEditMeetingDialog() => _showEditDialog = false;

    private async Task UpdateMeeting() {
        if (string.IsNullOrWhiteSpace(_editMeetingName)) {
            _meetingNameError = "Meeting name is required";
            return;
        }

        try {
            await GameApiClient.HttpClient.PutAsJsonAsync($"/api/meetings/{MeetingId}", new { Name = _editMeetingName });
            await LoadMeetingDetails();
            _showEditDialog = false;
        }
        catch (Exception ex) {
            _meetingNameError = $"Error updating meeting: {ex.Message}";
        }
    }

    private async Task SetActiveEpisode(Guid episode) {
        try {
            var response = await GameApiClient.HttpClient.PostAsync($"/api/meetings/{MeetingId}/episodes/{episode}/activate", null);
            response.EnsureSuccessStatusCode();
            await LoadMeetingDetails();
        }
        catch (Exception ex) {
            await Console.Error.WriteLineAsync($"Error setting active episode: {ex.Message}");
        }
    }

    private async Task StartMeeting() {
        try {
            var response = await GameApiClient.HttpClient.PostAsync($"/api/meetings/{MeetingId}/start", null);
            response.EnsureSuccessStatusCode();
            // Redirect to the game view once it's implemented
            // Navigation.NavigateTo($"/game/{MeetingId}");
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error starting meeting: {ex.Message}");
        }
    }
}