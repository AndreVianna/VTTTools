namespace VttTools.WebApp.Pages.Game;

public partial class EpisodesPage {
    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal EpisodesPageState State => Handler.State;
    internal EpisodesPageInputModel CreateInput => Handler.State.CreateInput;
    internal EpisodesPageInputModel EditInput => Handler.State.EditInput;

    protected override Task ConfigureComponentAsync()
        => Handler.InitializeAsync(AdventureId, GameService);

    internal Task CreateEpisode()
        => Handler.SaveCreatedEpisode();

    internal void StartEdit(Episode ep)
        => Handler.StartEpisodeEditing(ep);

    internal void CancelEdit()
        => Handler.EndEpisodeEditing();

    internal Task SaveEdit()
        => Handler.SaveEditedEpisode();

    internal Task DeleteEpisode(Guid id)
        => Handler.DeleteEpisode(id);

    internal Task CloneEpisode(Guid id)
        => Handler.CloneEpisode(id);
}