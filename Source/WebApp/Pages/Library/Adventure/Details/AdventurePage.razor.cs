namespace VttTools.WebApp.Pages.Library.Adventure.Details;

public partial class AdventurePage {
    [Inject]
    private ILibraryClient LibraryClient { get; set; } = null!;
    [Parameter]
    public string? Action { get; set; }
    [Parameter]
    public Guid Id { get; set; }
    internal AdventurePageState State { get; set; } = new();
    internal AdventureInput Input => State.Input;

    protected override async Task<bool> ConfigureAsync() {
        await base.ConfigureAsync();
        var isLoaded = await Handler.LoadAdventureAsync(LibraryClient);
        if (isLoaded)
            return true;
        NavigateBack();
        return false;
    }

    private void NavigateBack() => RedirectTo("/adventures");
    private void NavigateToEditAdventure() => RedirectTo($"/adventure/edit/{Id}");
    private void NavigateToCloneAdventure() => RedirectTo($"/adventure/clone/{Id}");

    private void NavigateToSceneBuilder(Guid sceneId) => TryExecute(() => RedirectTo($"/scenes/builder/{sceneId}"));
    private void TryNavigateBack() => TryExecute(() => State.FinishEditing = true);

    private async Task SubmitForm() {
        await Handler.SaveChangesAsync();
        if (State.FinishEditing) NavigateBack();
        else NavigateToEditAdventure();
    }

    private Task DeleteAdventure() {
        HideDeleteConfirmationModal();
        return Handler.DeleteAdventureAsync();
    }

    private void TryExecute(Action action) {
        if (!State.HasChanges) {
            action();
            return;
        }
        State.ExecutePendingAction = true;
        State.PendingAction = () => InvokeAsync(action);
        State.PendingChangesModalIsVisible = true;
    }

    private async Task TryExecuteAsync(Func<Task> action) {
        if (!State.HasChanges) {
            await action();
            return;
        }
        State.SaveChanges = false;
        State.ExecutePendingAction = true;
        State.PendingAction = action;
        State.PendingChangesModalIsVisible = true;
    }

    private void SaveAndContinue()
        => State.FinishEditing = false;

    private void SaveAndFinish()
        => State.FinishEditing = true;

    private async Task HidePendingChangesModal() {
        State.PendingChangesModalIsVisible = false;
        await Handler.SaveChangesAsync();
        if (State.ExecutePendingAction)
            await State.PendingAction();
    }

    private Task CancelAction() {
        State.SaveChanges = false;
        State.ExecutePendingAction = false;
        return HidePendingChangesModal();
    }

    private Task DiscardChangesAndExecuteAction() {
        State.SaveChanges = false;
        State.ExecutePendingAction = true;
        return HidePendingChangesModal();
    }

    private Task SaveChangesAndExecuteAction() {
        State.SaveChanges = true;
        State.ExecutePendingAction = true;
        return HidePendingChangesModal();
    }

    private void ShowDeleteConfirmationModal() {
        State.SaveChanges = false;
        State.DeleteConfirmationModalIsVisible = true;
    }

    private void HideDeleteConfirmationModal() => State.DeleteConfirmationModalIsVisible = false;

    private void ShowDeleteSceneConfirmationModal(Guid sceneId) {
        State.SaveChanges = false;
        State.SceneToDelete = sceneId;
        State.DeleteSceneConfirmationModalIsVisible = true;
    }

    private void HideDeleteSceneConfirmationModal() => State.DeleteSceneConfirmationModalIsVisible = false;

    private void DiscardChanges() => Handler.DiscardChanges();
    private Task TryCreateScene()
        => TryExecuteAsync(Handler.CreateSceneAsync);

    private async Task DeleteScene() {
        await StateHasChangedAsync();
        HideDeleteSceneConfirmationModal();
    }
}