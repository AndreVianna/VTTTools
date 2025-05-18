namespace VttTools.WebApp.Pages.Library.Adventures;

public class AdventureHandler(AdventurePage page)
    : PageHandler<AdventureHandler, AdventurePage>(page) {
    private ILibraryClient _client = null!;

    public async Task<bool> LoadAdventureAsync(ILibraryClient client) {
        _client = client;
        Page.State.Mode = Enum.Parse<DetailsPageMode>(Page.Action ?? "View", true);
        if (Page.State.Mode == DetailsPageMode.Create) return true;
        if (Page.Id == Guid.Empty) return false;
        var adventure = await client.GetAdventureByIdAsync(Page.Id);
        if (adventure == null) return false;
        Page.State.Input = adventure;
        if (Page.State.Mode == DetailsPageMode.Clone) {
            Page.State.Input.Name += " (Copy)";
            Page.State.Input.IsPublished = false;
            Page.State.Input.IsPublic = false;
        }

        Page.State.Original.Name = Page.State.Input.Name;
        Page.State.Original.Description = Page.State.Input.Description;
        Page.State.Original.Type = Page.State.Input.Type;
        Page.State.Original.IsPublished = Page.State.Input.IsPublished;
        Page.State.Original.IsPublic = Page.State.Input.IsPublic;
        Page.State.Original.Scenes = Page.State.Input.Scenes;
        return true;
    }

    internal Task SaveChangesAsync(bool continueEdit) {
        Page.State.Errors = [];
        return Page.State.Mode switch {
            DetailsPageMode.Create or DetailsPageMode.Clone => CreateAdventureAsync(continueEdit),
            DetailsPageMode.Edit => UpdateAdventureAsync(continueEdit),
            _ => Task.CompletedTask,
        };
    }

    public void DiscardChanges() {
        Page.State.Input.Name = Page.State.Original.Name;
        Page.State.Input.Description = Page.State.Original.Description;
        Page.State.Input.Type = Page.State.Original.Type;
        Page.State.Input.IsPublished = Page.State.Original.IsPublished;
        Page.State.Input.IsPublic = Page.State.Original.IsPublic;
        Page.State.Errors = [];
    }

    internal async Task DeleteAdventureAsync() {
        var deleted = await _client.DeleteAdventureAsync(Page.Id);
        if (deleted)
            Page.NavigationManager.NavigateTo("/adventures");
    }

    private async Task UpdateAdventureAsync(bool continueEdit) {
        var request = new UpdateAdventureRequest {
            Name = Page.Input.Name != Page.State.Original.Name ? Page.State.Input.Name : Optional<string>.None,
            Description = Page.Input.Description != Page.State.Original.Description ? Page.State.Input.Description : Optional<string>.None,
            Type = Page.Input.Type != Page.State.Original.Type ? Page.State.Input.Type : Optional<AdventureType>.None,
            IsListed = Page.Input.IsPublished != Page.State.Original.IsPublished ? Page.State.Input.IsPublished : Optional<bool>.None,
            IsPublic = Page.Input.IsPublic != Page.State.Original.IsPublic ? Page.State.Input.IsPublic : Optional<bool>.None,
        };

        var result = await _client.UpdateAdventureAsync(Page.Id, request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            await Page.StateHasChangedAsync();
            return;
        }

        var url = continueEdit
            ? $"/adventure/edit/{Page.Id}"
            : !string.IsNullOrEmpty(Page.State.PendingNavigationUrl)
                ? Page.State.PendingNavigationUrl
                : $"/adventure/view/{Page.Id}";
        Page.NavigationManager.NavigateTo(url);
    }

    private async Task CreateAdventureAsync(bool continueEdit) {
        var request = new CreateAdventureRequest {
            Name = Page.State.Input.Name,
            Description = Page.State.Input.Description,
            Type = Page.State.Input.Type,
        };

        var result = await _client.CreateAdventureAsync(request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            await Page.StateHasChangedAsync();
            return;
        }

        var url = continueEdit
            ? $"/adventure/edit/{result.Value.Id}"
            : !string.IsNullOrEmpty(Page.State.PendingNavigationUrl)
                ? Page.State.PendingNavigationUrl
                : $"/adventure/view/{result.Value.Id}";
        Page.NavigationManager.NavigateTo(url);
    }
}
