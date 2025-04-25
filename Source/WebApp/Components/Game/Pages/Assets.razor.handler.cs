namespace VttTools.WebApp.Components.Game.Pages;

public partial class Assets {
    internal class Handler {
        private IGameService _client = null!;

        internal async Task<PageState> InitializeAsync(IGameService client) {
            _client = client;

            var state = new PageState();

            await LoadAssetsAsync(state);

            return state;
        }

        internal async Task LoadAssetsAsync(PageState state) => state.Assets = await _client.GetAssetsAsync();

        internal async Task CreateAssetAsync(PageState state) {
            var request = new CreateAssetRequest {
                Name = state.Input.Name,

                Source = state.Input.Source,

                Type = state.Input.Type,

                Visibility = state.Input.Visibility,
            };

            var result = await _client.CreateAssetAsync(request);

            if (result.IsSuccessful) {
                state.Input = new();

                await LoadAssetsAsync(state);
            }
        }

        internal async Task DeleteAssetAsync(PageState state, Guid id) {
            await _client.DeleteAssetAsync(id);

            await LoadAssetsAsync(state);
        }
    }
}