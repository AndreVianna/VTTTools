namespace VttTools.WebApp.Server.Pages.Game.Chat;

public partial class ChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal ChatPageState State { get; set; } = new();
    internal ChatPageInput Input => State.Input;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.SetHubConnectionAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
    }

    public Task SendMessage()
        => Handler.SendMessage();
}