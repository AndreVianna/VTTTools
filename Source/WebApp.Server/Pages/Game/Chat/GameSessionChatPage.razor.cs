namespace VttTools.WebApp.Server.Pages.Game.Chat;

public partial class GameSessionChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal GameSessionChatPageState State { get; set; } = new();
    internal GameSessionChatInputModel Input => State.Input;

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.SetHubConnectionAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
    }

    public Task SendMessage()
        => Handler.SendMessage();
}