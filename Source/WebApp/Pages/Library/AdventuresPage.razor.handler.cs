namespace VttTools.WebApp.Pages.Library;

public class AdventuresPageHandler(IAuthenticatedPage page)
    : AuthenticatedPageHandler<AdventuresPageHandler>(page) {
    private ILibraryClient _client = null!;

    internal AdventuresPageState State { get; } = new();

    public async Task LoadAdventuresAsync(ILibraryClient client) {
        _client = client;
        State.Adventures = [.. await _client.GetAdventuresAsync()];
    }

    public async Task SaveCreatedAdventure() {
        var request = new CreateAdventureRequest {
            Name = State.CreateInput.Name,
            Visibility = State.CreateInput.Visibility,
        };

        var result = await _client.CreateAdventureAsync(request);
        if (!result.IsSuccessful) {
            State.CreateInput.Errors = [.. result.Errors];
            return;
        }
        State.CreateInput = new();
        State.Adventures.Add(result.Value);
        State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task DeleteAdventure(Guid id) {
        var deleted = await _client.DeleteAdventureAsync(id);
        if (!deleted)
            return;
        State.Adventures.RemoveAll(e => e.Id == id);
    }

    public void StartAdventureEditing(Adventure adventure) {
        State.EditInput = new() {
            Id = adventure.Id,
            Name = adventure.Name,
            Visibility = adventure.Visibility,
        };
        State.IsEditing = true;
    }

    public void EndAdventureEditing()
        => State.IsEditing = false;

    public async Task SaveEditedAdventure() {
        var request = new UpdateAdventureRequest {
            Name = State.EditInput.Name,
            Visibility = State.EditInput.Visibility,
        };
        var result = await _client.UpdateAdventureAsync(State.EditInput.Id, request);
        if (!result.IsSuccessful) {
            State.EditInput.Errors = [.. result.Errors];
            return;
        }
        var adventure = State.Adventures.Find(e => e.Id == State.EditInput.Id)!;
        adventure.Name = State.EditInput.Name;
        adventure.Visibility = State.EditInput.Visibility;
        State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
        EndAdventureEditing();
    }

    public async Task CloneAdventure(Guid id) {
        var request = new CloneAdventureRequest();
        var result = await _client.CloneAdventureAsync(id, request);
        State.Adventures.Add(result.Value);
        State.Adventures.Sort((x, y) => string.Compare(x.Name, y.Name, StringComparison.OrdinalIgnoreCase));
    }
}