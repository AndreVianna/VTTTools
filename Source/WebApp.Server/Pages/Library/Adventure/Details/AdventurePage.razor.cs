using VttTools.WebApp.Contracts.Library.Adventure;

namespace VttTools.WebApp.Pages.Library.Adventure.Details;

public partial class AdventurePage {
    [Inject]
    private ILibraryHttpClient Client { get; set; } = null!;
    [Parameter]
    public string? Action { get; set; }
    [Parameter]
    public Guid Id { get; set; }
    internal AdventurePageState State { get; set; } = new();
    internal AdventureDetails Input => State.Input;

    protected override async Task<bool> ConfigureAsync() {
        await base.ConfigureAsync();
        State.NextPage = string.Empty;
        State.SaveChanges = true;
        var isLoaded = await Handler.LoadAdventureAsync(Client);
        if (isLoaded)
            return true;
        NavigateBack();
        return false;
    }

    private void NavigateBack() => RedirectTo("/adventures");
    private void StartEditing() => State.NextPage = "EDIT";
    private void StartCloning() => State.NextPage = "CLONE";
    private void ReturnToList() => State.NextPage = "LIST";

    private void NavigateToSceneBuilder(Guid sceneId) => TryExecute(() => RedirectTo($"/scenes/builder/{sceneId}"));
    private void NavigateToSceneViewer(Guid sceneId) => TryExecute(() => RedirectTo($"/scenes/viewer/{sceneId}"));
    private void TryReturnToList() => TryExecute(() => State.NextPage = "LIST");

    private async Task SubmitForm() {
        await Handler.SaveChangesAsync();
        switch (State.NextPage) {
            case "EDIT":
                RedirectTo($"/adventure/edit/{Id}");
                break;
            case "CLONE":
                RedirectTo($"/adventure/clone/{Id}");
                break;
            case "LIST":
                NavigateBack();
                break;
        }
    }

    private Task DeleteAdventure() {
        HideDeleteConfirmationModal();
        return Handler.DeleteAdventureAsync();
    }

    private void TryExecute(Action action) {
        State.SaveChanges = false;
        if (!State.HasChanges) {
            action();
            return;
        }
        State.ExecutePendingAction = true;
        State.PendingAction = () => InvokeAsync(action);
        State.PendingChangesModalIsVisible = true;
    }

    private async Task TryExecuteAsync(Func<Task> action) {
        State.SaveChanges = false;
        if (!State.HasChanges) {
            await action();
            return;
        }
        State.ExecutePendingAction = true;
        State.PendingAction = action;
        State.PendingChangesModalIsVisible = true;
    }

    private void SaveAndContinue()
        => State.NextPage = "EDIT";

    private void SaveAndFinish()
        => State.NextPage = "LIST";

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