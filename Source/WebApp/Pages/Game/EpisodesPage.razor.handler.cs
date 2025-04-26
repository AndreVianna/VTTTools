namespace VttTools.WebApp.Pages.Game;

public partial class EpisodesPage {
    internal sealed class Handler() {
        private readonly IGameService _service = null!;

        internal Handler(Guid adventureId, IGameService service)
            : this() {
            _service = service;
            State.AdventureId = adventureId;
        }

        internal PageState State { get; } = new();

        public static async Task<Handler> InitializeAsync(Guid adventureId, IGameService service) {
            var handler = new Handler(adventureId, service);
            await handler.LoadEpisodesAsync();
            return handler;
        }

        public async Task LoadEpisodesAsync()
            => State.Episodes = [.. await _service.GetEpisodesAsync(State.AdventureId)];

        public async Task CreateEpisodeAsync() {
            var request = new CreateEpisodeRequest {
                AdventureId = State.AdventureId,
                Name = State.CreateInput.Name,
                Visibility = State.CreateInput.Visibility,
            };
            var result = await _service.CreateEpisodeAsync(request);
            if (!result.IsSuccessful) {
                State.CreateInput.Errors = [.. result.Errors];
                return;
            }
            State.CreateInput = new();
            State.Episodes.Add(result.Value);
            State.Episodes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        }

        public async Task DeleteEpisodeAsync(Guid id) {
            var deleted = await _service.DeleteEpisodeAsync(id);
            if (!deleted)
                return;
            State.Episodes.RemoveAll(e => e.Id == State.EditInput.Id);
        }

        public void StartEdit(Episode ep) {
            State.EditInput = new() {
                Id = ep.Id,
                Name = ep.Name,
                Visibility = ep.Visibility,
            };
            State.ShowEditDialog = true;
        }

        public void CancelEdit()
            => State.ShowEditDialog = false;

        public async Task SaveEditAsync() {
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
            State.ShowEditDialog = false;
        }

        public async Task CloneEpisodeAsync(Guid id) {
            var request = new CloneEpisodeRequest();
            var result = await _service.CloneEpisodeAsync(id, request);
            if (!result.IsSuccessful)
                return;
            State.Episodes.Add(result.Value);
            State.Episodes.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        }
    }
}