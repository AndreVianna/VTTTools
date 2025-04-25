namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    private readonly Handler _handler = new();

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal PageState? State { get; set; }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        State = await _handler.InitializeAsync(GameService);
    }

    internal Task CreateAdventure()
        => _handler.CreateAdventureAsync(State!);

    internal Task DeleteAdventure(Guid id)
        => _handler.DeleteAdventureAsync(State!, id);

    internal void StartEdit(Adventure adv)
        => Handler.StartEdit(State!, adv);

    internal void CancelEdit()
        => Handler.CancelEdit(State!);

    internal Task SaveEdit()
        => _handler.SaveEditAsync(State!);

    internal Task CloneAdventure(Guid id)
        => _handler.CloneAdventureAsync(State!, id);
}