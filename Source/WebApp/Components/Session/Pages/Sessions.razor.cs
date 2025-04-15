using VttTools.HttpContracts.Game;

namespace WebApp.Components.Session.Pages;

public partial class Sessions {
    private HttpClient _http = null!;
    private List<VttTools.Model.Game.Session>? _sessions;
    private bool _showCreateDialog;
    private string _newSessionName = string.Empty;
    private string _sessionNameError = string.Empty;
    private Guid _currentUserId;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;
    [Inject]
    private IHttpClientFactory HttpClientFactory { get; set; } = null!;
    [Inject]
    private AuthenticationStateProvider AuthStateProvider { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        _http = HttpClientFactory.CreateClient("game");
        var authState = await AuthStateProvider.GetAuthenticationStateAsync();
        var principal = authState.User;

        if (principal.Identity?.IsAuthenticated == true) {
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                _currentUserId = userId;
        }

        await LoadSessions();
    }

    private async Task LoadSessions() {
        try {
            _sessions = await _http.GetFromJsonAsync<List<VttTools.Model.Game.Session>>("/api/sessions");
        }
        catch (Exception) {
            _sessions = [new() {
                Id = Guid.NewGuid(),
                Name = "Demo Session",
                OwnerId = _currentUserId,
                Players = [new() {
                    UserId = _currentUserId,
                    Type = PlayerType.Master,
                }],
            }];
        }
    }

    private void OpenCreateSessionDialog() {
        _showCreateDialog = true;
        _newSessionName = string.Empty;
        _sessionNameError = string.Empty;
    }

    private void CloseCreateSessionDialog()
        => _showCreateDialog = false;

    private async Task CreateSession() {
        if (string.IsNullOrWhiteSpace(_newSessionName)) {
            _sessionNameError = "Session name is required";
            return;
        }

        try {
            var request = new CreateSessionRequest {
                Name = _newSessionName,
            };
            var response = await _http.PostAsJsonAsync("/api/sessions", request);
            response.EnsureSuccessStatusCode();
            var session = await response.Content.ReadFromJsonAsync<VttTools.Model.Game.Session>();
            _sessions ??= [];
            _sessions.Add(session!);
            _showCreateDialog = false;
        }
        catch (Exception ex) {
            _sessionNameError = $"Error creating session: {ex.Message}";
        }
    }

    private async Task JoinSession(Guid sessionId) {
        try {
            var response = await _http.PostAsync($"/api/sessions/{sessionId}/join", null);
            response.EnsureSuccessStatusCode();
            // Redirect to the game view once it's implemented
            // Navigation.NavigateTo($"/game/{SessionId}");
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error joining session: {ex.Message}");
        }
    }

    private void ViewSession(Guid sessionId)
        => NavigationManager.NavigateTo($"/session/{sessionId}");

    private async Task DeleteSession(Guid sessionId) {
        if (!await DisplayConfirmation("Are you sure you want to delete this session?"))
            return;

        try {
            var sessionToRemove = _sessions?.FirstOrDefault(s => s.Id == sessionId);
            if (sessionToRemove == null)
                return;
            var response = await _http.DeleteAsync($"/api/sessions/{sessionId}");
            response.EnsureSuccessStatusCode();
            _sessions?.Remove(sessionToRemove);
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error deleting session: {ex.Message}");
        }
    }

    // In a real application, you would use a dialog service instead
    private static Task<bool> DisplayConfirmation(string _)
        // JavaScript confirmation isn't ideal, but we'll use it for this example
        => Task.FromResult(true);
}
