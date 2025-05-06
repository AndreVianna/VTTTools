namespace VttTools.WebApp.Pages.Game;

public sealed class EpisodesPageHandler(HttpContext httpContext, NavigationManager navigationManager, User user, ILoggerFactory loggerFactory)
    : PrivateComponentHandler<EpisodesPageHandler>(httpContext, navigationManager, user, loggerFactory) {
    private IGameService _service = null!;

    internal EpisodesPageState State { get; } = new();

    public async Task ConfigureAsync(Guid adventureId, IGameService service) {
        _service = service;
        State.AdventureId = adventureId;
        State.Episodes = [.. await _service.GetEpisodesAsync(State.AdventureId)];
    }

    public async Task SaveCreatedEpisode() {
        var request = new CreateEpisodeRequest {
            Name = State.CreateInput.Name,
        };
        var result = await _service.CreateEpisodeAsync(State.AdventureId, request);
        if (!result.IsSuccessful) {
            State.CreateInput.Errors = [.. result.Errors];
            return;
        }
        State.CreateInput = new();
        State.Episodes.Add(result.Value);
        State.Episodes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteEpisode(Guid episodeId) {
        var deleted = await _service.RemoveEpisodeAsync(State.AdventureId, episodeId);
        if (!deleted)
            return;
        State.Episodes.RemoveAll(e => e.Id == episodeId);
    }

    public void StartEpisodeEditing(Episode ep) {
        State.EditInput = new() {
            Id = ep.Id,
            Name = ep.Name,
            Visibility = ep.Visibility,
        };
        State.IsEditing = true;
    }

    public void EndEpisodeEditing()
        => State.IsEditing = false;

    public async Task SaveEditedEpisode() {
        var request = new UpdateEpisodeRequest {
            Name = State.EditInput.Name,
            Visibility = State.EditInput.Visibility,
        };
        var result = await _service.UpdateEpisodeAsync(State.EditInput.Id, request);
        if (!result.IsSuccessful) {
            State.EditInput.Errors = [.. result.Errors];
            return;
        }
        var episode = State.Episodes.Find(e => e.Id == State.EditInput.Id)!;
        episode.Name = State.EditInput.Name;
        episode.Visibility = State.EditInput.Visibility;
        State.Episodes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        EndEpisodeEditing();
    }

    public async Task CloneEpisode(Guid id) {
        var request = new AddClonedEpisodeRequest {
            Id = id,
            Name = State.CreateInput.Name,
        };
        var result = await _service.CloneEpisodeAsync(State.AdventureId, request);
        if (!result.IsSuccessful)
            return;
        State.Episodes.Add(result.Value);
        State.Episodes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }
}