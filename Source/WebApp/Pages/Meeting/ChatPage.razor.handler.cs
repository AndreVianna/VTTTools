namespace VttTools.WebApp.Pages.Meeting;

public sealed class ChatPageHandler
    : IAsyncDisposable {
    private HubConnection _hubConnection = null!;
    private Func<Task> _refreshPage = () => Task.CompletedTask;

    internal ChatPageState State { get; } = new();

    public ValueTask DisposeAsync()
        => _hubConnection.DisposeAsync();

    public Task InitializeAsync(IHubConnectionBuilder builder, Uri chatUri, Func<Task> refresh) {
        _refreshPage = refresh;
        _hubConnection = builder.WithUrl(chatUri).Build();
        _hubConnection.On<string>("ReceiveMessage", OnMessageReceived);
        return _hubConnection.StartAsync();
    }

    public Task OnMessageReceived(string message) {
        State.Messages.Add(new(ChatMessageDirection.Received, message));
        return _refreshPage();
    }

    public async Task SendMessage() {
        if (string.IsNullOrWhiteSpace(State.Input.Message))
            return;
        await _hubConnection.SendAsync("SendMessage", State.Input.Message);
        State.Messages.Add(new(ChatMessageDirection.Sent, State.Input.Message));
        State.Input.Message = string.Empty;
        await _refreshPage();
    }
}