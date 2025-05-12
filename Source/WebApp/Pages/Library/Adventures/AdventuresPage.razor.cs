namespace VttTools.WebApp.Pages.Library.Adventures;

public partial class AdventuresPage {
    [Inject]
    internal ILibraryClient LibraryClient { get; set; } = null!;

    internal AdventuresPageState State => Handler.State;

    protected override async Task<bool> ConfigureAsync() {
        if (!await base.ConfigureAsync())
            return false;

        await Handler.LoadAdventuresAsync(LibraryClient);
        return true;
    }

    internal void GoToCreatePage()
        => NavigationManager.NavigateTo("/adventure/create");

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