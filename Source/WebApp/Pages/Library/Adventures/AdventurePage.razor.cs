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

    private void NavigateBack() => TryNavigateTo("/adventures");
    private void NavigateToEditAdventure() => TryNavigateTo($"/adventure/edit/{Id}");
    private void NavigateToCloneAdventure() => TryNavigateTo($"/adventure/clone/{Id}");
    private void NavigateToSceneBuilder(Guid sceneId) => TryNavigateTo($"/scenes/builder/{sceneId}");

    private Task SaveAndGoBack() => Handler.SaveChangesAsync(false);
    private Task SaveAndContinueEditing() => Handler.SaveChangesAsync(true);

    private Task DeleteAdventure() {
        HideDeleteConfirmationModal();
        return Handler.DeleteAdventureAsync();
    }

    private void TryNavigateTo(string url)
        => TryExecute(() => NavigationManager.NavigateTo(url));

    private void TryExecute(Action action) {
        if (!State.HasChanges) {
            action();
            return;
        }
        State.PendingAction = () => InvokeAsync(action);
        ShowUnsavedChangesModal();
    }

    private async Task TryExecuteAsync(Func<Task> action) {
        if (!State.HasChanges) {
            await action();
            return;
        }
        State.PendingAction = action;
        ShowUnsavedChangesModal();
    }

    internal void ShowUnsavedChangesModal() => State.PendingChangesModalIsVisible = true;

    private Task HideUnsavedChangesModal(bool executePendingAction) {
        State.PendingChangesModalIsVisible = false;
        return executePendingAction ? State.PendingAction() : Task.CompletedTask;
    }
    private Task CancelAction() => HideUnsavedChangesModal(executePendingAction: false);
    private Task ContinueActionWithoutSaving() => HideUnsavedChangesModal(executePendingAction: true);
    private async Task SaveAndContinueAction() {
        await SaveAndGoBack();
        await HideUnsavedChangesModal(true);
    }

    private void ShowDeleteConfirmationModal() => State.DeleteConfirmationModalIsVisible = true;
    private void HideDeleteConfirmationModal() => State.DeleteConfirmationModalIsVisible = false;

    private void ShowDeleteSceneConfirmationModal(Guid sceneId) {
        State.SceneToDelete = sceneId;
        State.DeleteSceneConfirmationModalIsVisible = true;
    }
    private void HideDeleteSceneConfirmationModal() => State.DeleteSceneConfirmationModalIsVisible = false;

    private void TryDiscardChanges()
        => TryExecute(Handler.DiscardChanges);

    private Task TryCreateScene()
        => TryExecuteAsync(Handler.CreateSceneAsync);

    private async Task DeleteScene() {
        await StateHasChangedAsync();
        HideDeleteSceneConfirmationModal();
    }
}