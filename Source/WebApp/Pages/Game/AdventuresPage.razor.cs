namespace VttTools.WebApp.Pages.Game;

public partial class AdventuresPage {
    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal AdventuresPageState State => Handler.State;
    internal AdventuresPageInputModel CreateInput => Handler.State.CreateInput;
    internal AdventuresPageInputModel EditInput => Handler.State.EditInput;

    protected override async Task OnParametersSetAsync() {
        await Handler.InitializeAsync(GameService);
        await base.OnParametersSetAsync();
    }

    internal Task CreateAdventure()
        => Handler.CreateAdventureAsync();

    internal void StartEdit(Adventure adv)
        => Handler.StartEdit(adv);

    internal void CancelEdit()
        => Handler.CancelEdit();

    internal Task SaveEdit()
        => Handler.SaveEditAsync();

    internal Task DeleteAdventure(Guid id)
        => Handler.DeleteAdventureAsync(id);

    internal Task CloneAdventure(Guid id)
        => Handler.CloneAdventureAsync(id);
}