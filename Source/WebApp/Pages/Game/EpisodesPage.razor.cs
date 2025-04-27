namespace VttTools.WebApp.Pages.Game;

public partial class EpisodesPage {
    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal EpisodesPageState State => Handler.State;
    internal EpisodesPageInputModel CreateInput => Handler.State.CreateInput;
    internal EpisodesPageInputModel EditInput => Handler.State.EditInput;

    protected override async Task OnParametersSetAsync() {
        await Handler.InitializeAsync(AdventureId, GameService);
        await base.OnParametersSetAsync();
    }

    internal Task CreateEpisode()
        => Handler.CreateEpisodeAsync();

    internal void StartEdit(Episode ep)
        => Handler.StartEdit(ep);

    internal void CancelEdit()
        => Handler.CancelEdit();

    internal Task SaveEdit()
        => Handler.SaveEditAsync();

    internal Task DeleteEpisode(Guid id)
        => Handler.DeleteEpisodeAsync(id);

    internal Task CloneEpisode(Guid id)
        => Handler.CloneEpisodeAsync(id);
}