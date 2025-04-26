namespace VttTools.WebApp.Pages.Game;

public partial class AdventuresPage {
    private Handler _handler = null!;

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal bool IsLoading { get; set; } = true;
    internal PageState State => _handler.State;

    protected override async Task OnParametersSetAsync() {
        _handler = await Handler.InitializeAsync(GameService);
        IsLoading = false;
    }

    internal Task CreateAdventure()
        => _handler.CreateAdventureAsync();

    internal void StartEdit(Adventure adv)
        => _handler.StartEdit(adv);

    internal void CancelEdit()
        => _handler.CancelEdit();

    internal Task SaveEdit()
        => _handler.SaveEditAsync();

    internal Task DeleteAdventure(Guid id)
        => _handler.DeleteAdventureAsync(id);

    internal Task CloneAdventure(Guid id)
        => _handler.CloneAdventureAsync(id);
}