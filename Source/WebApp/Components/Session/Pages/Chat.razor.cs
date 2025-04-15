using Microsoft.AspNetCore.SignalR.Client;

namespace WebApp.Components.Session.Pages;

public partial class Chat {
    private HubConnection? _hubConnection;
    private readonly List<string> _messages = [];
    private string? _newMessage;

    [Inject]
    private NavigationManager NavigationManager { get; set; } = null!;

    protected override async Task OnInitializedAsync() {
        _hubConnection = new HubConnectionBuilder()
                       .WithUrl(NavigationManager.ToAbsoluteUri("/hubs/chat"))
                       .Build();

        _hubConnection.On<string>("ReceiveMessage",
                                 (message) => {
                                     _messages.Add(message);
                                     InvokeAsync(StateHasChanged);
                                 });

        await _hubConnection.StartAsync();
    }

    private async Task SendMessage() {
        if (!string.IsNullOrEmpty(_newMessage)) {
            await _hubConnection!.SendAsync("SendMessage", _newMessage);
            _newMessage = string.Empty;
        }
    }

    public async ValueTask DisposeAsync() {
        if (_hubConnection is not null)
            await _hubConnection.DisposeAsync();
    }
}
