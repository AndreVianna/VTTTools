namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Chat : IAsyncDisposable {
    private Handler _handler = null!;

    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        _handler = await Handler.InitializeAsync(HubConnectionBuilder, GetAbsolutePath("/hubs/chat"), RefreshAsync);
        IsLoading = false;
    }

    public Task SendMessage()
        => _handler.SendMessage();

    public async ValueTask DisposeAsync() {
        await _handler.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}