namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal GameSessionChatPageState State => Handler.State;
    internal GameSessionChatInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
        return true;
    }

    public Task SendMessage()
        => Handler.SendMessage();
}