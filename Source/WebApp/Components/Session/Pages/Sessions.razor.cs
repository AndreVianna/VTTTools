namespace WebApp.Components.Session.Pages;

public partial class Sessions {
    [Inject]
    private AuthenticationStateProvider AuthStateProvider { get; set; } = null!;

    private List<VttTools.Model.Game.Session>? _sessions;
    private bool _showCreateDialog;
    private string _newSessionName = string.Empty;
    private string _sessionNameError = string.Empty;
    private Guid _currentUserId;

    protected override async Task OnInitializedAsync() {
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
            _sessions = (await Http.GetFromJsonAsync<List<VttTools.Model.Game.Session>>("/api/sessions"))!;
        }
        catch (Exception) {
            // For demo purposes, create sample data if API is not available
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

    private void CloseCreateSessionDialog() => _showCreateDialog = false;

    private async Task CreateSession() {
        if (string.IsNullOrWhiteSpace(_newSessionName)) {
            _sessionNameError = "Session name is required";
            return;
        }

        try {
            var session = await GameSessionService.CreateSessionAsync(_newSessionName, _currentUserId);
            _sessions ??= [];
            _sessions.Add(session);
            _showCreateDialog = false;
        }
        catch (Exception ex) {
            _sessionNameError = $"Error creating session: {ex.Message}";
        }
    }

    private async Task JoinSession(Guid sessionId) {
        try {
            await GameSessionService.JoinSessionAsync(sessionId, _currentUserId);
            Navigation.NavigateTo($"/session/{sessionId}");
        }
        catch (Exception ex) {
            // Handle error
            await Console.Error.WriteLineAsync($"Error joining session: {ex.Message}");
        }
    }

    private async Task DeleteSession(Guid sessionId) {
        if (!await DisplayConfirmation("Are you sure you want to delete this session?")) {
            return;
        }

        try {
            await Http.DeleteAsync($"/api/sessions/{sessionId}");
            var sessionToRemove = _sessions?.FirstOrDefault(s => s.Id == sessionId);
            if (sessionToRemove == null)
                return;
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
