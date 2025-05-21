using static System.StringComparison;

namespace VttTools.WebApp.Pages.Library.Adventure.List;

public class AdventuresHandler(AdventuresPage page)
    : PageHandler<AdventuresHandler, AdventuresPage>(page) {
    private ILibraryClient _client = null!;

    public async Task LoadAdventuresAsync(ILibraryClient client) {
        _client = client;
        Page.State.Adventures = [..await _client.GetAdventuresAsync()];
        ApplyFilters();
    }

    public void ApplyFilters() {
        var query = Page.State.Adventures.AsQueryable();
        query = Page.State.FilterType.HasValue
            ? query.Where(a => a.Type == Page.State.FilterType.Value)
            : query;

        var search = Page.State.SearchText?.Trim() ?? string.Empty;
        query = !string.IsNullOrWhiteSpace(Page.State.SearchText)
            ? query.Where(a => a.Name.Contains(search, InvariantCultureIgnoreCase)
                            || a.Description.Contains(search, InvariantCultureIgnoreCase))
            : query;

        var ownedFiltered = query.Where(a => a.OwnerId == Page.User!.Id).OrderBy(a => a.Name);
        var publicFiltered = query.Where(a => a.OwnerId != Page.User!.Id).OrderBy(a => a.Name);

        Page.State.OwnedAdventures = [..ownedFiltered];
        Page.State.PublicAdventures = [..publicFiltered];
    }

    public void ToggleViewMode() => Page.State.ListViewMode = Page.State.ListViewMode == ListViewMode.List
            ? ListViewMode.Card
            : ListViewMode.List;

    public void SetFilterType(AdventureType? type) {
        Page.State.FilterType = type;
        ApplyFilters();
    }

    public void SetSearchText(string? text) {
        Page.State.SearchText = text;
        ApplyFilters();
    }

    public async Task DeleteAdventure(Guid id) {
        var deleted = await _client.DeleteAdventureAsync(id);
        if (!deleted)
            return;

        Page.State.Adventures.RemoveAll(e => e.Id == id);
        ApplyFilters();
    }

    public async Task CloneAdventure(Guid id) {
        var request = new CloneAdventureRequest {
            Name = $"{Page.State.Adventures.First(a => a.Id == id).Name} (Copy)",
        };

        var result = await _client.CloneAdventureAsync(id, request);
        if (!result.IsSuccessful)
            return;
        Page.State.Adventures.Add(result.Value);
        ApplyFilters();
    }
}