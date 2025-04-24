namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    internal class Handler {
        private IGameServiceClient _client = null!;

        internal async Task<PageState> InitializeAsync(IGameServiceClient client) {
            _client = client;
            var state = new PageState();
            await LoadAdventuresAsync(state);
            return state;
        }

        internal async Task LoadAdventuresAsync(PageState state) => state.Adventures = await _client.GetAdventuresAsync();

        internal async Task CreateAdventureAsync(PageState state) {
            var request = new CreateAdventureRequest {
                Name = state.Input.Name,
                Visibility = state.Input.Visibility,
            };

            var result = await _client.CreateAdventureAsync(request);

            if (result.IsSuccessful) {
                state.Input = new();
                await LoadAdventuresAsync(state);
            }
        }

        internal async Task DeleteAdventureAsync(PageState state, Guid id) {
            await _client.DeleteAdventureAsync(id);
            await LoadAdventuresAsync(state);
        }

        internal static void StartEdit(PageState state, Adventure adv) {
            state.IsEditing = true;
            state.EditingAdventureId = adv.Id;
            state.Input = new() {
                Name = adv.Name,
                Visibility = adv.Visibility,
            };
        }

        internal static void CancelEdit(PageState state) => state.IsEditing = false;

        internal async Task SaveEditAsync(PageState state) {
            var request = new UpdateAdventureRequest {
                Name = state.Input.Name,
                Visibility = state.Input.Visibility,
            };
            var result = await _client.UpdateAdventureAsync(state.EditingAdventureId, request);
            if (result.IsSuccessful) {
                state.IsEditing = false;
                await LoadAdventuresAsync(state);
            }
        }

        internal async Task CloneAdventureAsync(PageState state, Guid id) {
            var request = new CloneAdventureRequest();
            var result = await _client.CloneAdventureAsync(id, request);
            if (result.IsSuccessful) await LoadAdventuresAsync(state);
        }
    }
}