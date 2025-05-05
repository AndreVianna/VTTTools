namespace VttTools.WebApp.Pages.Meeting;

public sealed class ChatPageHandler(HttpContext httpContext, NavigationManager navigationManager, CurrentUser currentUser, ILoggerFactory loggerFactory)
    : AuthorizedComponentHandler<ChatPageHandler, ChatPage>(httpContext, navigationManager, currentUser, loggerFactory) {
    private HubConnection _hubConnection = null!;
    private Func<Task> _onStateChangedAsync = () => Task.CompletedTask;

    internal ChatPageState State { get; } = new();

    protected override async ValueTask DisposeAsyncCore() {
        await _hubConnection.DisposeAsync();
        await base.DisposeAsyncCore();
    }

    public Task ConfigureAsync(IHubConnectionBuilder builder, Uri chatUri, Func<Task> onStateChangeAsync) {
        _onStateChangedAsync = onStateChangeAsync;
        _hubConnection = builder.WithUrl(chatUri).Build();
        _hubConnection.On<string>("ReceiveMessage", OnMessageReceived);
        return _hubConnection.StartAsync();
    }

    public Task OnMessageReceived(string message) {
        State.Messages.Add(new(ChatMessageDirection.Received, message));
        return _onStateChangedAsync();
    }

    public async Task SendMessage() {
        if (string.IsNullOrWhiteSpace(State.Input.Message))
            return;
        await _hubConnection.SendAsync("SendMessage", State.Input.Message);
        State.Messages.Add(new(ChatMessageDirection.Sent, State.Input.Message));
        State.Input.Message = string.Empty;
        await _onStateChangedAsync();
    }
}