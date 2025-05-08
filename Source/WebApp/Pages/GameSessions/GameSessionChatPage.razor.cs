namespace VttTools.WebApp.Pages.GameSessions;

public partial class GameSessionChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal GameSessionChatPageState State => Handler.State;
    internal GameSessionChatInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;
        await Handler.SetHubConnectionAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
        return true;
    }

    public Task SendMessage()
        => Handler.SendMessage();
}