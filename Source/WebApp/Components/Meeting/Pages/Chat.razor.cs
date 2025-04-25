namespace VttTools.WebApp.Components.Meeting.Pages;

public partial class Chat : IAsyncDisposable {
    private readonly Handler _handler = new();

    internal PageState State { get; init; } = new();

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        await _handler.InitializeAsync(GetAbsolutePath("/hubs/chat"), State, RefreshAsync);
    }

    internal Task SendMessage()
        => _handler.SendMessage();

    public ValueTask DisposeAsync()
        => _handler.DisposeAsync();
}