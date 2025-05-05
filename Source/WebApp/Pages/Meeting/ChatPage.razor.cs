namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal ChatPageState State => Handler.State;
    internal ChatPageInputModel Input => Handler.State.Input;

    protected override async Task<bool> ConfigureComponentAsync() {
        await Handler.ConfigureAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
        return true;
    }

    public Task SendMessage()
        => Handler.SendMessage();
}