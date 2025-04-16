namespace WebApp.Components.Session.Pages;

public partial class SessionDetails {
    [Parameter]
    public Guid SessionId { get; set; }

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private GameServiceClient GameApiClient { get; set; } = null!;
    [Inject]
    private AuthenticationStateProvider AuthStateProvider { get; set; } = null!;

    private VttTools.Model.Game.Session? _session;
    private Guid _currentUserId;
    private bool _isGameMaster;
    private bool _showEditDialog;
    private string _editSessionName = string.Empty;
    private string _sessionNameError = string.Empty;

    protected override async Task OnInitializedAsync() {
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var user = authState.User;

        if (user.Identity?.IsAuthenticated == true) {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                _currentUserId = userId;
        }

        await LoadSessionDetails();
    }

    protected override Task OnParametersSetAsync() => LoadSessionDetails();

    private async Task LoadSessionDetails() {
        try {
            var response = await GameApiClient.HttpClient.GetAsync($"/api/sessions/{SessionId}");
            response.EnsureSuccessStatusCode();
            _session = await response.Content.ReadFromJsonAsync<VttTools.Model.Game.Session>();
            if (_session == null)
                return;
            _isGameMaster = _session.OwnerId == _currentUserId ||
                            _session.Players.Any(p => p.UserId == _currentUserId && p.Type == PlayerType.Master);
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error loading session: {ex.Message}");
            NavigationManager.NavigateTo("/sessions");
        }
    }

    private void NavigateToSessions() => NavigationManager.NavigateTo("/sessions");

    private void OpenEditSessionDialog() {
        if (_session == null)
            return;

        _editSessionName = _session.Name;
        _sessionNameError = string.Empty;
        _showEditDialog = true;
    }

    private void CloseEditSessionDialog() => _showEditDialog = false;

    private async Task UpdateSession() {
        if (string.IsNullOrWhiteSpace(_editSessionName)) {
            _sessionNameError = "Session name is required";
            return;
        }

        try {
            await GameApiClient.HttpClient.PutAsJsonAsync($"/api/sessions/{SessionId}", new { Name = _editSessionName });
            await LoadSessionDetails();
            _showEditDialog = false;
        }
        catch (Exception ex) {
            _sessionNameError = $"Error updating session: {ex.Message}";
        }
    }

    private async Task SetActiveMap(int map) {
        try {
            var response = await GameApiClient.HttpClient.PostAsync($"/api/sessions/{SessionId}/maps/{map}/activate", null);
            response.EnsureSuccessStatusCode();
            await LoadSessionDetails();
        }
        catch (Exception ex) {
            await Console.Error.WriteLineAsync($"Error setting active map: {ex.Message}");
        }
    }

    private async Task StartSession() {
        try {
            var response = await GameApiClient.HttpClient.PostAsync($"/api/sessions/{SessionId}/start", null);
            response.EnsureSuccessStatusCode();
            // Redirect to the game view once it's implemented
            // Navigation.NavigateTo($"/game/{SessionId}");
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error starting session: {ex.Message}");
        }
    }
}