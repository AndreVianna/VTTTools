using static System.StringComparison;

namespace VttTools.WebApp.Pages.Library.Adventures.Handlers;

public class AdventuresHandler(IAuthenticatedPage page)
    : AuthenticatedPageHandler<AdventuresHandler>(page) {
    private ILibraryClient _client = null!;
    private Guid _currentUserId;

    internal AdventuresPageState State { get; } = new();

    public async Task LoadAdventuresAsync(ILibraryClient client) {
        _client = client;
        _currentUserId = Page.UserId;

        State.Adventures = [..await _client.GetAdventuresAsync()];
        SplitAndFilterAdventures();
    }

    private void SplitAndFilterAdventures() {
        // Split adventures into owned and public
        State.OwnedAdventures = [.. State.Adventures.Where(a => a.OwnerId == _currentUserId)];

        State.PublicAdventures = [.. State.Adventures.Where(a => a.OwnerId != _currentUserId && a.IsPublic && a.IsVisible)];

        // Apply any current filters
        ApplyFilters();
    }

    public void ApplyFilters() {
        var ownedFiltered = State.OwnedAdventures;
        var publicFiltered = State.PublicAdventures;

        // Apply type filter if selected
        if (State.FilterType.HasValue) {
            ownedFiltered = [.. ownedFiltered.Where(a => a.Type == State.FilterType.Value)];

            publicFiltered = [.. publicFiltered.Where(a => a.Type == State.FilterType.Value)];
        }

        // Apply text search if provided
        if (!string.IsNullOrWhiteSpace(State.SearchText)) {
            var search = State.SearchText.Trim().ToLowerInvariant();

            ownedFiltered = [.. ownedFiltered
                .Where(a => a.Name.Contains(search, InvariantCultureIgnoreCase) ||
                           a.Description.Contains(search, InvariantCultureIgnoreCase))];

            publicFiltered = [.. publicFiltered
                .Where(a => a.Name.Contains(search, InvariantCultureIgnoreCase) ||
                           a.Description.Contains(search, InvariantCultureIgnoreCase))];
        }

        // Sort adventures
        ownedFiltered = [.. ownedFiltered.OrderBy(a => a.Name)];

        publicFiltered = [.. publicFiltered.OrderBy(a => a.Name)];

        // Update filtered lists
        State.OwnedAdventures = ownedFiltered;
        State.PublicAdventures = publicFiltered;
    }

    public void ToggleViewMode() => State.CurrentViewMode = State.CurrentViewMode == AdventuresPageState.ViewMode.List
            ? AdventuresPageState.ViewMode.Card
            : AdventuresPageState.ViewMode.List;

    public void SetFilterType(AdventureType? type) {
        State.FilterType = type;
        ApplyFilters();
    }

    public void SetSearchText(string? text) {
        State.SearchText = text;
        ApplyFilters();
    }

    public async Task SaveCreatedAdventure() {
        var request = new CreateAdventureRequest {
            Name = State.CreateInput.Name,
            Description = State.CreateInput.Description,
            Type = State.CreateInput.Type,
            ImagePath = State.CreateInput.ImagePath,
            IsVisible = State.CreateInput.IsVisible,
            IsPublic = State.CreateInput.IsPublic,
            CampaignId = State.CreateInput.CampaignId,
        };

        var result = await _client.CreateAdventureAsync(request);
        if (!result.IsSuccessful) {
            State.CreateInput.Errors = [.. result.Errors];
            return;
        }

        State.CreateInput = new();
        State.Adventures.Add(result.Value);
        SplitAndFilterAdventures();
    }

    public async Task DeleteAdventure(Guid id) {
        var deleted = await _client.DeleteAdventureAsync(id);
        if (!deleted)
            return;

        State.Adventures.RemoveAll(e => e.Id == id);
        SplitAndFilterAdventures();
    }

    public async Task StartAdventureEditing(Guid id) {
        var adventure = await _client.GetAdventureByIdAsync(id);
        if (adventure == null)
            return;
        State.EditInput = adventure;
        State.IsEditing = true;
    }

    public void EndAdventureEditing()
        => State.IsEditing = false;

    public async Task SaveEditedAdventure() {
        var request = new UpdateAdventureRequest {
            Name = State.EditInput.Name,
            Description = State.EditInput.Description,
            Type = State.EditInput.Type,
            ImagePath = State.EditInput.ImagePath,
            IsVisible = State.EditInput.IsVisible,
            IsPublic = State.EditInput.IsPublic,
            CampaignId = State.EditInput.CampaignId,
        };

        var result = await _client.UpdateAdventureAsync(State.EditInput.Id, request);
        if (!result.IsSuccessful) {
            State.EditInput.Errors = [.. result.Errors];
            return;
        }

        var adventure = State.Adventures.Find(e => e.Id == State.EditInput.Id)!;
        adventure.Name = State.EditInput.Name;
        adventure.Description = State.EditInput.Description;
        adventure.Type = State.EditInput.Type;
        adventure.ImagePath = State.EditInput.ImagePath;
        adventure.IsVisible = State.EditInput.IsVisible;
        adventure.IsPublic = State.EditInput.IsPublic;

        SplitAndFilterAdventures();
        EndAdventureEditing();
    }

    public async Task CloneAdventure(Guid id) {
        var request = new CloneAdventureRequest {
            Name = $"{State.Adventures.First(a => a.Id == id).Name} (Copy)",
        };

        var result = await _client.CloneAdventureAsync(id, request);
        if (!result.IsSuccessful)
            return;
        State.Adventures.Add(result.Value);
        SplitAndFilterAdventures();
    }
}