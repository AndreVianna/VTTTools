namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage {
    internal sealed class Handler()
        : IAsyncDisposable {
        private readonly HubConnection _hubConnection = null!;
        private readonly Func<Task> _refresh = () => Task.CompletedTask;

        internal Handler(IHubConnectionBuilder builder, Uri chatUri, Func<Task> refresh)
            : this() {
            _hubConnection = builder.WithUrl(chatUri).Build();
            _hubConnection.On<string>("ReceiveMessage", OnMessageReceived);
            _refresh = refresh;
        }

        internal PageState State { get; } = new();

        public ValueTask DisposeAsync()
            => _hubConnection.DisposeAsync();

        public static async Task<Handler> InitializeAsync(IHubConnectionBuilder builder, Uri chatUri, Func<Task> refresh) {
            var handler = new Handler(builder, chatUri, refresh);
            await handler._hubConnection.StartAsync();
            return handler;
        }

        public Task OnMessageReceived(string message) {
            State.Messages.Add(new(ChatMessageDirection.Received, message));
            return _refresh();
        }

        public async Task SendMessage() {
            if (string.IsNullOrWhiteSpace(State.NewMessage))
                return;
            await _hubConnection.SendAsync("SendMessage", State.NewMessage);
            State.Messages.Add(new(ChatMessageDirection.Sent, State.NewMessage));
            State.NewMessage = string.Empty;
            await _refresh();
        }
    }
}