using VttTools.WebApp.Pages.Game.Chat.Models;

namespace VttTools.WebApp.Pages.Game.Chat;

public sealed class GameSessionChatPageHandler(GameSessionChatPage page)
    : PageHandler<GameSessionChatPageHandler, GameSessionChatPage>(page)
    , IAsyncDisposable {
    private HubConnection _hubConnection = null!;
    private Func<Task> _onStateChangedAsync = () => Task.CompletedTask;

    public ValueTask DisposeAsync()
        => _hubConnection.DisposeAsync();

    public Task SetHubConnectionAsync(IHubConnectionBuilder builder, Uri chatUri, Func<Task> onStateChangeAsync) {
        _onStateChangedAsync = onStateChangeAsync;
        _hubConnection = builder.WithUrl(chatUri).Build();
        _hubConnection.On<string>("ReceiveMessage", OnMessageReceived);
        return _hubConnection.StartAsync();
    }

    public Task OnMessageReceived(string message) {
        Page.State.Messages.Add(new(ChatMessageDirection.Received, message));
        return _onStateChangedAsync();
    }

    public async Task SendMessage() {
        if (string.IsNullOrWhiteSpace(Page.State.Input.Message))
            return;
        await _hubConnection.SendAsync("SendMessage", Page.State.Input.Message);
        Page.State.Messages.Add(new(ChatMessageDirection.Sent, Page.State.Input.Message));
        Page.State.Input.Message = string.Empty;
        await _onStateChangedAsync();
    }
}