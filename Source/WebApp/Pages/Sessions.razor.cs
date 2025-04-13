namespace WebApp.Pages;

public partial class Sessions {
    private List<GameSession>? _sessions;

    protected override async Task OnInitializedAsync() => _sessions = (await Http.GetFromJsonAsync<List<GameSession>>("/sessions"))!;

    private async Task CreateSession() {
        _sessions ??= [];
        var name = "New Session " + DateTime.Now.ToShortTimeString();
        var response = await Http.PostAsJsonAsync("/sessions",
                                                  new {
                                                      Name = name,
                                                      UserId = Guid.CreateVersion7(),
                                                  });
        var session = (await response.Content.ReadFromJsonAsync<GameSession>())!;
        _sessions.Add(session);
    }
}
