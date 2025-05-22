namespace VttTools.WebApp.Pages.Library.Adventure.List;

public partial class AdventuresPage {
    [Inject]
    internal ILibraryServerHttpClient LibraryServerHttpClient { get; set; } = null!;

    internal AdventuresPageState State { get; set; } = new();

    protected override async Task ConfigureAsync() {
        await base.ConfigureAsync();
        await Handler.LoadAdventuresAsync(LibraryServerHttpClient);
    }

    internal void GoToCreatePage()
        => NavigationManager.NavigateTo("/adventure/create");

    internal void RedirectTo(string url)
        => NavigationManager.NavigateTo(url);

    private void ApplySearch() => Handler.SetSearchText(State.SearchText);

    private void ClearSearch() {
        State.SearchText = null;
        Handler.SetSearchText(null);
    }

    private void ApplyTypeFilter()
        => Handler.SetFilterType(State.FilterType);

    internal Task DeleteAdventure(Guid id)
        => Handler.DeleteAdventure(id);
}