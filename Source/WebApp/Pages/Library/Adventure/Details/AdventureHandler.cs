namespace VttTools.WebApp.Pages.Library.Adventure.Details;

public class AdventureHandler(AdventurePage page)
    : PageHandler<AdventureHandler, AdventurePage>(page) {
    private ILibraryClient _client = null!;

    public async Task<bool> LoadAdventureAsync(ILibraryClient client) {
        _client = client;
        Page.State.Mode = Enum.Parse<DetailsPageMode>(Page.Action ?? "View", true);
        if (Page.State.Mode == DetailsPageMode.Create)
            return true;
        if (Page.Id == Guid.Empty)
            return false;
        var adventure = await client.GetAdventureByIdAsync(Page.Id);
        if (adventure == null)
            return false;
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

    internal async Task DeleteAdventureAsync() {
        var deleted = await _client.DeleteAdventureAsync(Page.Id);
        if (deleted)
            Page.NavigationManager.NavigateTo("/adventures");
    }

    internal async Task SaveChangesAsync() {
        if (Page.State.Mode == DetailsPageMode.View) return;
        if (!Page.State.SaveChanges) return;

        Page.State.Errors = [];
        switch (Page.State.Mode)
        {
            case DetailsPageMode.Create or DetailsPageMode.Clone:
                await CreateAdventureAsync();
                break;
            case DetailsPageMode.Edit:
                await UpdateAdventureAsync();
                break;
        }

        if (Page.State.Errors.Length > 0)
            Page.State.ExecutePendingAction = false;
    }

    public void DiscardChanges() {
        Page.State.SaveChanges = false;
        Page.State.Input.Name = Page.State.Original.Name;
        Page.State.Input.Description = Page.State.Original.Description;
        Page.State.Input.Type = Page.State.Original.Type;
        Page.State.Input.IsPublished = Page.State.Original.IsPublished;
        Page.State.Input.IsPublic = Page.State.Original.IsPublic;
        Page.State.Errors = [];
    }

    private async Task UpdateAdventureAsync() {
        var request = new UpdateAdventureRequest {
            Name = Page.Input.Name != Page.State.Original.Name ? Page.State.Input.Name : Optional<string>.None,
            Description = Page.Input.Description != Page.State.Original.Description ? Page.State.Input.Description : Optional<string>.None,
            Type = Page.Input.Type != Page.State.Original.Type ? Page.State.Input.Type : Optional<AdventureType>.None,
            IsPublished = Page.Input.IsPublished != Page.State.Original.IsPublished ? Page.State.Input.IsPublished : Optional<bool>.None,
            IsPublic = Page.Input.IsPublic != Page.State.Original.IsPublic ? Page.State.Input.IsPublic : Optional<bool>.None,
        };

        var result = await _client.UpdateAdventureAsync(Page.Id, request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            await Page.StateHasChangedAsync();
        }
    }

    private async Task CreateAdventureAsync() {
        var request = new CreateAdventureRequest {
            Name = Page.State.Input.Name,
            Description = Page.State.Input.Description,
            Type = Page.State.Input.Type,
        };

        var result = await _client.CreateAdventureAsync(request);
        if (!result.IsSuccessful) {
            Page.State.Errors = [.. result.Errors];
            await Page.StateHasChangedAsync();
        }
    }

    internal async Task CreateSceneAsync() {
        var request = new AddNewSceneRequest {
            Name = "New Scene",
            Description = "This is a new scene.",
        };
        var result = await _client.CreateSceneAsync(Page.Id, request);
        if (result.IsSuccessful) {
            Page.RedirectTo($"/scenes/builder/{result.Value.Id}");
            return;
        }

        Page.SetStatusMessage("Error: Unable to create scene.");
        await Page.StateHasChangedAsync();
    }
}
