namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage : IAsyncDisposable {
    private Handler _handler = null!;

    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal bool IsReady { get; set; }
    internal PageState State => _handler?.State ?? new();

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _handler = await Handler.InitializeAsync(HubConnectionBuilder, GetAbsolutePath("/hubs/chat"), RefreshAsync);
        IsReady = true;
    }

    public Task SendMessage()
        => _handler.SendMessage();

    public async ValueTask DisposeAsync() {
        await _handler.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}