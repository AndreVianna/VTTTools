namespace VttTools.WebApp.Components.Game.Pages;

public partial class Assets {
    internal class Handler {
        private GameServiceClient _gameServiceClient = null!;

        internal async Task<PageState> InitializeAsync(GameServiceClient gameServiceClient) {
            _gameServiceClient = gameServiceClient;

            var state = new PageState();

            await LoadAssetsAsync(state);

            return state;
        }

        internal async Task LoadAssetsAsync(PageState state) => state.Assets = await _gameServiceClient.GetAssetsAsync();

        internal async Task CreateAssetAsync(PageState state) {
            var request = new CreateAssetRequest {
                Name = state.Input.Name,

                Source = state.Input.Source,

                Type = state.Input.Type,

                Visibility = state.Input.Visibility,
            };

            var result = await _gameServiceClient.CreateAssetAsync(request);

            if (result.IsSuccessful) {
                state.Input = new();

                await LoadAssetsAsync(state);
            }
        }

        internal async Task DeleteAssetAsync(PageState state, Guid id) {
            await _gameServiceClient.DeleteAssetAsync(id);

            await LoadAssetsAsync(state);
        }
    }
}