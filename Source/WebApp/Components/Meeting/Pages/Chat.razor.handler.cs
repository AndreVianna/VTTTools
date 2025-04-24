using Microsoft.AspNetCore.Mvc.RazorPages;

namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Chat {
    internal class Handler : IAsyncDisposable {
        private HubConnection _hubConnection = null!;
        private PageState _state = null!;
        private Func<Task> _refresh = () => Task.CompletedTask;

        public Task InitializeAsync(Uri chatUri, PageState state, Func<Task> refresh) {
            _state = state;
            _refresh = refresh;
            _hubConnection = new HubConnectionBuilder().WithUrl(chatUri).Build();
            _hubConnection.On<string>("ReceiveMessage", OnMessageReceived);
            return _hubConnection.StartAsync();
        }

        public Task OnMessageReceived(string message) {
            _state.Messages.Add(new(ChatMessageDirection.Received, message));
            return _refresh();
        }

        public async Task SendMessage() {
            if (string.IsNullOrWhiteSpace(_state.NewMessage)) return;
            await _hubConnection.SendAsync("SendMessage", _state.NewMessage);
            _state.Messages.Add(new(ChatMessageDirection.Sent, _state.NewMessage));
            _state.NewMessage = string.Empty;
            await _refresh();
        }

        public ValueTask DisposeAsync()
            => _hubConnection?.DisposeAsync() ?? ValueTask.CompletedTask;
    }
}