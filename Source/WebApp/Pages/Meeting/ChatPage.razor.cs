namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal ChatPageState State => Handler.State;
    internal ChatPageInputModel Input => Handler.State.Input;

    protected override Task ConfigureComponentAsync()
        => Handler.InitializeAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);

    public Task SendMessage()
        => Handler.SendMessage();
}