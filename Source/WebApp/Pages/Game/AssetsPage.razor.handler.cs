namespace VttTools.WebApp.Pages.Game;

public partial class AssetsPage {
    internal class Handler() {
        private readonly IGameService _service = null!;

        internal Handler(IGameService service)
            : this() {
            _service = service;
        }

        internal PageState State { get; } = new();

        public static async Task<Handler> InitializeAsync(IGameService service) {
            var handler = new Handler(service);
            await handler.LoadAssetsAsync();
            return handler;
        }

        public async Task LoadAssetsAsync()
            => State.Assets = [.. await _service.GetAssetsAsync()];

        public async Task CreateAssetAsync() {
            var request = new CreateAssetRequest {
                Name = State.Input.Name,
                Source = State.Input.Source,
                Type = State.Input.Type,
                Visibility = State.Input.Visibility,
            };

            var result = await _service.CreateAssetAsync(request);

            if (!result.IsSuccessful) {
                State.Input.Errors = [.. result.Errors];
                return;
            }
            State.Input = new();
            State.Assets.Add(result.Value);
            State.Assets.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        }

        public async Task DeleteAssetAsync(Guid id) {
            var deleted = await _service.DeleteAssetAsync(id);
            if (!deleted)
                return;
            State.Assets.RemoveAll(e => e.Id == State.Input.Id);
        }
    }
}