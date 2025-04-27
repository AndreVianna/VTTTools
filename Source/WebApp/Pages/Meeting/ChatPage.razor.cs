namespace VttTools.WebApp.Pages.Meeting;

public partial class ChatPage {
    [Inject]
    internal IHubConnectionBuilder HubConnectionBuilder { get; set; } = null!;

    internal ChatPageState State => Handler.State;
    internal ChatPageInputModel Input => Handler.State.Input;

    protected override async Task OnParametersSetAsync() {
        await Handler.InitializeAsync(HubConnectionBuilder, GetAbsoluteUri("/hubs/chat"), StateHasChangedAsync);
        await base.OnParametersSetAsync();
    }

    public Task SendMessage()
        => Handler.SendMessage();
}