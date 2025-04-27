namespace VttTools.WebApp.Pages.Game;

public partial class EpisodesPage {
    private Handler _handler = null!;

    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal bool IsReady { get; set; }
    internal PageState State => _handler?.State ?? new();

    protected override async Task OnParametersSetAsync() {
        _handler = await Handler.InitializeAsync(AdventureId, GameService);
        IsReady = true;
    }

    internal Task CreateEpisode()
        => _handler.CreateEpisodeAsync();

    internal void StartEdit(Episode ep)
        => _handler.StartEdit(ep);

    internal void CancelEdit()
        => _handler.CancelEdit();

    internal Task SaveEdit()
        => _handler.SaveEditAsync();

    internal Task DeleteEpisode(Guid id)
        => _handler.DeleteEpisodeAsync(id);

    internal Task CloneEpisode(Guid id)
        => _handler.CloneEpisodeAsync(id);
}