namespace VttTools.WebApp.Components.Game.Pages;

public partial class Episodes {
    internal class Handler {
        private IGameServiceClient _client = null!;

        internal async Task<PageState> InitializeAsync(IGameServiceClient client, Guid adventureId) {
            _client = client;
            var state = new PageState {
                AdventureId = adventureId,
            };
            await LoadEpisodesAsync(state);
            return state;
        }

        internal async Task LoadEpisodesAsync(PageState state) => state.Episodes = await _client.GetEpisodesAsync(state.AdventureId);

        internal async Task CreateEpisodeAsync(PageState state) {
            var request = new CreateEpisodeRequest {
                AdventureId = state.AdventureId,
                Name = state.Input.Name,
                Visibility = state.Input.Visibility,
            };
            var result = await _client.CreateEpisodeAsync(request);
            if (result.IsSuccessful) {
                state.Input = new();
                await LoadEpisodesAsync(state);
            }
        }

        internal static void StartEdit(PageState state, Episode ep) {
            state.IsEditing = true;
            state.EditingEpisodeId = ep.Id;
            state.Input = new() {
                Name = ep.Name,
                Visibility = ep.Visibility,
            };
        }

        internal static void CancelEdit(PageState state) => state.IsEditing = false;

        internal async Task SaveEditAsync(PageState state) {
            var request = new UpdateEpisodeRequest {
                Name = state.Input.Name,
                Visibility = state.Input.Visibility,
            };
            var result = await _client.UpdateEpisodeAsync(state.EditingEpisodeId, request);
            if (result.IsSuccessful) {
                state.IsEditing = false;
                await LoadEpisodesAsync(state);
            }
        }

        internal async Task DeleteEpisodeAsync(PageState state, Guid id) {
            await _client.DeleteEpisodeAsync(id);
            await LoadEpisodesAsync(state);
        }

        internal async Task CloneEpisodeAsync(PageState state, Guid id) {
            var request = new CloneEpisodeRequest();
            var result = await _client.CloneEpisodeAsync(id, request);
            if (result.IsSuccessful) await LoadEpisodesAsync(state);
        }
    }
}