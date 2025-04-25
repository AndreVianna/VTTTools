namespace VttTools.WebApp.Components.Game.Pages;

public partial class Episodes() {
    private readonly Handler _handler = new();

    internal Episodes(Guid adventureId)
        : this() {
        AdventureId = adventureId;
    }

    [Parameter]
    public Guid AdventureId { get; set; }

    [Inject]
    internal IGameService GameService { get; set; } = null!;

    internal PageState? State { get; set; }

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        State = await _handler.InitializeAsync(GameService, AdventureId);
    }

    internal Task CreateEpisode()
        => _handler.CreateEpisodeAsync(State!);

    internal void StartEdit(Episode ep)
        => Handler.StartEdit(State!, ep);

    internal void CancelEdit()
        => Handler.CancelEdit(State!);

    internal Task SaveEdit()
        => _handler.SaveEditAsync(State!);

    internal Task DeleteEpisode(Guid id)
        => _handler.DeleteEpisodeAsync(State!, id);

    internal Task CloneEpisode(Guid id)
        => _handler.CloneEpisodeAsync(State!, id);
}