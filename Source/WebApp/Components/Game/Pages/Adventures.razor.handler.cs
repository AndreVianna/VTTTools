namespace VttTools.WebApp.Components.Game.Pages;

public partial class Adventures {
    internal class Handler() {
        private readonly IGameService _service = null!;

        internal Handler(IGameService service)
            : this() {
            _service = service;
        }

        internal PageState State { get; } = new();

        public static async Task<Handler> InitializeAsync(IGameService service) {
            var handler = new Handler(service);
            await handler.LoadAdventuresAsync();
            return handler;
        }

        public async Task LoadAdventuresAsync()
            => State.Adventures = [.. await _service.GetAdventuresAsync()];

        public async Task CreateAdventureAsync() {
            var request = new CreateAdventureRequest {
                Name = State.CreateInput.Name,
                Visibility = State.CreateInput.Visibility,
            };

            var result = await _service.CreateAdventureAsync(request);
            if (!result.IsSuccessful)
                return;
            State.CreateInput = new();
            State.Adventures.Add(result.Value);
            State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        }

        public async Task DeleteAdventureAsync(Guid id) {
            var deleted = await _service.DeleteAdventureAsync(id);
            if (!deleted)
                return;
            State.Adventures.RemoveAll(e => e.Id == State.EditInput.Id);
        }

        public void StartEdit(Adventure adventure) {
            State.ShowEditDialog = true;
            State.EditInput = new() {
                Id = adventure.Id,
                Name = adventure.Name,
                Visibility = adventure.Visibility,
            };
        }

        public void CancelEdit()
            => State.ShowEditDialog = false;

        public async Task SaveEditAsync() {
            var request = new UpdateAdventureRequest {
                Name = State.EditInput.Name,
                Visibility = State.EditInput.Visibility,
            };
            var result = await _service.UpdateAdventureAsync(State.EditInput.Id, request);
            if (!result.IsSuccessful)
                return;
            var adventure = State.Adventures.Find(e => e.Id == State.EditInput.Id)!;
            adventure.Name = State.EditInput.Name;
            adventure.Visibility = State.EditInput.Visibility;
            State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
            State.ShowEditDialog = false;
        }

        public async Task CloneAdventureAsync(Guid id) {
            var request = new CloneAdventureRequest();
            var result = await _service.CloneAdventureAsync(id, request);
            if (!result.IsSuccessful)
                return;
            State.Adventures.Add(result.Value);
            State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        }
    }
}