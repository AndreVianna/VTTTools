namespace VttTools.WebApp.Pages.Library.Adventures;

public partial class AdventurePage {
    [Inject]
    private ILibraryClient LibraryClient { get; set; } = null!;
    [Parameter]
    public string? Action { get; set; }
    [Parameter]
    public Guid Id { get; set; }
    internal AdventurePageState State { get; set; } = new();
    internal AdventureInputModel Input => State.Input;

    protected override async Task<bool> ConfigureAsync() {
        await base.ConfigureAsync();
        var isLoaded = await Handler.LoadAdventureAsync(LibraryClient);
        if (isLoaded) return true;
        NavigateBack();
        return false;
    }

    private void NavigateBack()
        => NavigateTo("/adventures");

    private void NavigateTo(string url) {
        if (State.HasChanges) {
            ShowUnsavedChangesModal(url);
            return;
        }
        NavigationManager.NavigateTo(url);
    }

    private Task SaveChanges() => Handler.SaveChangesAsync();

    private void DiscardChanges() => Handler.DiscardChanges();

    private Task DeleteAdventure() {
        HideDeleteConfirmationModal();
        return Handler.DeleteAdventureAsync();
    }

    private void ShowDeleteSceneConfirmation(Guid sceneId) {
        State.SceneToDelete = sceneId;
        State.DeleteSceneConfirmationModalIsVisible = true;
    }

    private void ShowUnsavedChangesModal(string url) {
        State.UnsavedChangesModalIsVisible = true;
        State.PendingNavigationUrl = url;
    }
    private void HideUnsavedChangesModal() => State.UnsavedChangesModalIsVisible = false;
    private void ShowDeleteConfirmationModal() => State.DeleteConfirmationModalIsVisible = true;
    private void HideDeleteConfirmationModal() => State.DeleteConfirmationModalIsVisible = false;
    private void ShowDeleteSceneConfirmationModal() => State.DeleteSceneConfirmationModalIsVisible = true;
    private void HideDeleteSceneConfirmationModal() => State.DeleteSceneConfirmationModalIsVisible = false;

    private async Task DeleteScene() {
        await StateHasChangedAsync();
        HideDeleteSceneConfirmationModal();
    }

    private async Task SaveAndContinue() {
        await SaveChanges();
        HideUnsavedChangesModal();
    }

    private void ContinueWithoutSaving() {
        NavigationManager.NavigateTo(State.PendingNavigationUrl!);
        HideUnsavedChangesModal();
    }
}